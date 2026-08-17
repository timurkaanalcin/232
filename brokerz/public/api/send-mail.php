<?php
/**
 * UBS mail API — Resend / SMTP / PHP mail()
 * POST JSON: { "to":"a@b.com", "subject":"...", "text":"...", "html":"..." }
 * Config: copy send-mail.config.sample.php → send-mail.config.php
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'POST only']);
  exit;
}

$cfgFile = __DIR__ . '/send-mail.config.php';
$cfg = file_exists($cfgFile) ? include $cfgFile : [
  'driver' => 'mail',
  'from' => 'noreply@ubs.customer.org.tr',
  'from_name' => 'UBS',
  'resend_api_key' => '',
];

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data || empty($data['to']) || empty($data['subject'])) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Invalid payload']);
  exit;
}

$to = filter_var($data['to'], FILTER_VALIDATE_EMAIL);
$subject = substr(strip_tags((string)$data['subject']), 0, 200);
$text = (string)($data['text'] ?? '');
$html = (string)($data['html'] ?? nl2br(htmlspecialchars($text)));
$from = $cfg['from'] ?? 'noreply@ubs.customer.org.tr';
$fromName = $cfg['from_name'] ?? 'UBS';

if (!$to) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Invalid email']);
  exit;
}

$driver = $cfg['driver'] ?? 'mail';
$ok = false;
$error = '';

if ($driver === 'resend' && !empty($cfg['resend_api_key'])) {
  $payload = json_encode([
    'from' => $fromName . ' <' . $from . '>',
    'to' => [$to],
    'subject' => $subject,
    'text' => $text,
    'html' => $html,
  ]);
  $ch = curl_init('https://api.resend.com/emails');
  curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
      'Authorization: Bearer ' . $cfg['resend_api_key'],
      'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_TIMEOUT => 20,
  ]);
  $resp = curl_exec($ch);
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  $ok = $code >= 200 && $code < 300;
  if (!$ok) $error = 'Resend HTTP ' . $code . ' ' . $resp;
} else {
  $headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=utf-8',
    'From: ' . $fromName . ' <' . $from . '>',
    'Reply-To: ' . $from,
    'X-Mailer: UBS-PHP',
  ];
  $ok = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $html, implode("\r\n", $headers));
  if (!$ok) $error = 'PHP mail() failed';
}

// Always log locally for audit / demo fallback
@file_put_contents(
  __DIR__ . '/mail-log.jsonl',
  json_encode(['at' => date('c'), 'to' => $to, 'subject' => $subject, 'ok' => $ok], JSON_UNESCAPED_UNICODE) . "\n",
  FILE_APPEND
);

echo json_encode(['ok' => $ok, 'driver' => $driver, 'error' => $ok ? null : $error]);
