-- Migration 0012: Real broker order tracking

ALTER TABLE crm_trade_orders ADD COLUMN broker_order_id TEXT NOT NULL DEFAULT '';
ALTER TABLE crm_trade_orders ADD COLUMN broker_message TEXT NOT NULL DEFAULT '';
ALTER TABLE crm_trade_orders ADD COLUMN execution_mode TEXT NOT NULL DEFAULT 'live';

CREATE INDEX idx_trade_orders_broker_order ON crm_trade_orders(broker_order_id);
CREATE INDEX idx_trade_orders_execution_mode ON crm_trade_orders(execution_mode);
