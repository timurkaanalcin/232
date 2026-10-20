<?php
/** Rename/copy to send-mail.config.php on server */
return [
  'driver' => 'mail', // mail | resend
  'from' => 'noreply@ubs.customer.org.tr',
  'from_name' => 'UBS',
  'resend_api_key' => '', // set for Resend
];
