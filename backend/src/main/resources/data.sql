-- Sample data for SIM Activation Portal
USE sim_activation_db;
-- Insert sample customers
INSERT IGNORE INTO customers (name, email, phone, id_number, address, sim_type) VALUES
('John Doe', 'john.doe@example.com', '+1234567890', 'ID123456', '123 Main St, City, Country', 'Jio'),
('Jane Smith', 'jane.smith@example.com', '+0987654321', 'ID654321', '456 Oak Ave, Town, Country', 'Airtel');

-- Insert sample SIM cards
INSERT IGNORE INTO sim_cards (aadhaar_number, msisdn, network, status) VALUES
('123456789012', '1234567890', 'Jio', 'AVAILABLE'),
('223456789012', '0987654321', 'Airtel', 'AVAILABLE'),
('323456789012', '1122334455', 'Vi', 'ACTIVATED');

-- Insert sample plans
INSERT IGNORE INTO plans (network_name, price, benefits, validity) VALUES
('Jio', 299, '1.5GB/day, unlimited calls, 100 SMS/day, JioTV, JioCinema', '28 days'),
('Jio', 719, '2GB/day, unlimited calls, 100 SMS/day, 5G access', '84 days'),
('Jio', 289, '40GB total data, unlimited calls, SMS benefits', '30 days'),
('Jio', 3599, '2.5GB/day, unlimited calls, OTT apps, JioHotstar, 5G', '365 days'),
('Jio', 448, 'Unlimited calls, limited data, good for secondary SIM', '84 days'),
('Airtel', 299, '2GB/day, unlimited calls, 100 SMS/day', '28 days'),
('Airtel', 379, '2GB/day + Unlimited 5G + Airtel Thanks', '1 month'),
('Airtel', 509, '1.5GB/day, unlimited calls, SMS', '84 days'),
('Airtel', 3599, '2.5GB/day, unlimited 5G, Hotstar, Wynk Music', '365 days'),
('Airtel', 469, 'Unlimited calls, SMS, minimal data', '84 days'),
('Vi', 299, 'Daily data + unlimited calls + starter 5G', '28 days'),
('Vi', 349, '2GB/day, OTT benefits, calls', '28 days'),
('Vi', 470, 'Unlimited calls plan', '84 days'),
('Vi', 859, '1.5GB/day or 2GB/day depending on region', '84 days'),
('Vi', 3799, '2GB/day, OTT subscriptions, annual plan', '365 days'),
('BSNL', 99, 'Unlimited calls, basic data', '14 days'),
('BSNL', 141, '1.5GB/day, unlimited calls', '30 days'),
('BSNL', 225, '2.5GB/day, unlimited calls', '30 days'),
('BSNL', 439, 'Unlimited calling plan, ideal for backup SIM', '90 days'),
('BSNL', 1551, '2GB/day, unlimited calls', '365 days');

-- Insert sample activations
INSERT IGNORE INTO activations (sim_card_id, customer_id, plan, status) VALUES
(3, 1, 'Basic Plan', 'ACTIVE'),
(3, 2, 'Premium Plan', 'SUSPENDED');