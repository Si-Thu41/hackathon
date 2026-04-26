CREATE TABLE medicines (
    medicine_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    category VARCHAR(100),
    dosage VARCHAR(50), -- e.g. 500mg
    form VARCHAR(50), -- tablet, syrup, injection
    manufacturer VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    expiry_date DATE
);

CREATE TABLE suppliers (
    supplier_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT
);

CREATE TABLE purchases (
    purchase_id SERIAL PRIMARY KEY,
    supplier_id INT REFERENCES suppliers(supplier_id),
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2)
);

CREATE TABLE purchase_items (
    id SERIAL PRIMARY KEY,
    purchase_id INT REFERENCES purchases(purchase_id),
    medicine_id INT REFERENCES medicines(medicine_id),
    quantity INT NOT NULL,
    cost_price DECIMAL(10,2),
    expiry_date DATE
);

CREATE TABLE sales (
    sale_id SERIAL PRIMARY KEY,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2),
    payment_method VARCHAR(50) -- cash, card, etc.
);

CREATE TABLE sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INT REFERENCES sales(sale_id),
    medicine_id INT REFERENCES medicines(medicine_id),
    quantity INT NOT NULL,
    price DECIMAL(10,2)
);

CREATE TABLE inventory_alerts (
    alert_id SERIAL PRIMARY KEY,
    medicine_id INT REFERENCES medicines(medicine_id),
    alert_type VARCHAR(50), -- 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRING'
    threshold INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--INSERT DATA
INSERT INTO medicines 
(name, generic_name, category, dosage, form, manufacturer, price, stock_quantity, expiry_date)
VALUES
('Tylenol', 'paracetamol', 'Analgesic', '500 mg', 'tablet', 'Kenvue', 500, 60, '2027-12-31'),
('Paracap', 'paracetamol', 'Analgesic', '500 mg', 'tablet', 'Masssa Lab Co., Ltd.', 600, 60, '2027-12-31');

INSERT INTO suppliers (name, contact_person, phone, email, address)
VALUES
('Kenvue', 'John Carter', '0123456789', 'contact@kenvue.com', 'USA'),
('Messsa Lab Co., Ltd.', 'Aung Min', '0987654321', 'info@messsa.com', 'Myanmar');

INSERT INTO purchases (supplier_id, purchase_date, total_amount)
VALUES
(1, CURRENT_TIMESTAMP, 30000), -- Kenvue (Tylenol)
(2, CURRENT_TIMESTAMP, 36000); -- Messsa (Paracap)

INSERT INTO purchase_items (purchase_id, medicine_id, quantity, cost_price, expiry_date)
VALUES
-- Tylenol from Kenvue
(1, 1, 60, 400, '2027-12-31'),

-- Paracap from Messsa Lab
(2, 2, 60, 500, '2027-12-31');

INSERT INTO sales (sale_date, total_amount, payment_method)
VALUES
(CURRENT_TIMESTAMP, 1100, 'cash');

INSERT INTO sale_items (sale_id, medicine_id, quantity, price)
VALUES
(1, 1, 1, 500), -- Tylenol sold
(1, 2, 1, 600); -- Paracap sold

ALTER TABLE medicines 
ADD COLUMN cards_per_box INT DEFAULT 10;

--UPDATE
UPDATE medicines
SET stock_quantity = stock_quantity * cards_per_box;

INSERT INTO purchases (supplier_id, purchase_date, total_amount)
VALUES
(1, CURRENT_TIMESTAMP, 24000),
(2, CURRENT_TIMESTAMP, 30000);

INSERT INTO purchase_items (purchase_id, medicine_id, quantity, cost_price, expiry_date)
VALUES
(5, 1, 600, 40, '2027-12-31'), -- Tylenol (600 cards)
(6, 2, 600, 50, '2027-12-31'); -- Paracap (600 cards)


UPDATE medicines
SET stock_quantity = stock_quantity + 600
WHERE medicine_id = 1;

UPDATE medicines
SET stock_quantity = stock_quantity + 600
WHERE medicine_id = 2;

INSERT INTO sales (sale_date, revenue, payment_method)
VALUES
(CURRENT_TIMESTAMP, 170, 'cash');

INSERT INTO sale_items (sale_id, medicine_id, quantity, price)
VALUES
(3, 1, 2, 50), -- 2 cards Tylenol
(4, 2, 3, 60); -- 3 cards Paracap

UPDATE medicines
SET stock_quantity = stock_quantity - 2
WHERE medicine_id = 1;

UPDATE medicines
SET stock_quantity = stock_quantity - 3
WHERE medicine_id = 2;

SELECT name, stock_quantity 
FROM medicines;



ALTER TABLE public.medicines
  ADD COLUMN unit_code  character varying,
  ADD COLUMN image_url  text;

CREATE TABLE public.vaccine_bookings (
  booking_id   SERIAL PRIMARY KEY,
  patient_name VARCHAR(255) NOT NULL,
  phone        VARCHAR(50),
  vaccine_name VARCHAR(255) NOT NULL,
  booking_date DATE        NOT NULL DEFAULT CURRENT_DATE,
  booking_time TIME,
  status       VARCHAR(50) NOT NULL DEFAULT 'pending',
  notes        TEXT,
  created_at   TIMESTAMP   NOT NULL DEFAULT NOW(),
  CONSTRAINT vaccine_bookings_status_check
    CHECK (status IN ('pending', 'completed', 'cancelled'))
);

CREATE INDEX idx_vaccine_bookings_date ON public.vaccine_bookings (booking_date);
