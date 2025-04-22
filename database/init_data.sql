-- Insert main categories
INSERT INTO categories (name, description, image_url) VALUES 
('Guitars', 'Acoustic and electric guitars', 'guitar.jpg'),
('Drums & Percussion', 'Drums, cymbals, and percussion instruments', 'drums.jpg'),
('Keyboards', 'Pianos, synthesizers, and MIDI controllers', 'keyboard.jpg'),
('Vinyl Records', 'Vinyl records across all genres', 'vinyl.jpg'),
('Audio Equipment', 'Turntables, speakers, and amplifiers', 'audio.jpg'),
('Accessories', 'Instrument accessories and parts', 'accessories.jpg');

-- Insert subcategories for guitars
INSERT INTO categories (name, parent_id, description, image_url) VALUES 
('Acoustic Guitars', 1, 'Traditional acoustic guitars', 'acoustic-guitar.jpg'),
('Electric Guitars', 1, 'Electric guitars for all styles', 'electric-guitar.jpg'),
('Bass Guitars', 1, 'Four and five-string bass guitars', 'bass-guitar.jpg');

-- Insert subcategories for vinyl
INSERT INTO categories (name, parent_id, description, image_url) VALUES 
('Rock & Pop', 4, 'Rock and pop vinyl records', 'rock-vinyl.jpg'),
('Jazz', 4, 'Jazz vinyl records', 'jazz-vinyl.jpg'),
('Classical', 4, 'Classical music vinyl records', 'classical-vinyl.jpg'),
('Hip Hop', 4, 'Hip hop and R&B vinyl records', 'hiphop-vinyl.jpg');

-- Insert sample products (guitars)
INSERT INTO products (name, description, price, category_id, stock_quantity, brand, sku, featured) VALUES
('Fender Stratocaster', 'Classic electric guitar with three single-coil pickups and a tremolo bridge', 1499.99, 8, 10, 'Fender', 'FEND-STRAT-001', 1),
('Gibson Les Paul Standard', 'Iconic electric guitar with dual humbucker pickups and mahogany body', 2499.99, 8, 5, 'Gibson', 'GIBS-LP-001', 1),
('Martin D-28', 'Premium acoustic guitar with solid spruce top and rosewood back and sides', 2899.99, 7, 3, 'Martin', 'MART-D28-001', 0),
('Ibanez SR500', '4-string bass guitar with active electronics', 699.99, 9, 8, 'Ibanez', 'IBAN-SR500-001', 0);

-- Insert sample products (vinyl records)
INSERT INTO products (name, description, price, category_id, stock_quantity, brand, sku, featured) VALUES
('Pink Floyd - Dark Side of the Moon', 'Iconic 1973 album on 180g vinyl', 34.99, 10, 15, 'Pink Floyd', 'VINYL-PF-DSOTM', 1),
('Miles Davis - Kind of Blue', 'Legendary jazz album on 180g vinyl', 29.99, 11, 10, 'Miles Davis', 'VINYL-MD-KOB', 0),
('Beethoven - Symphony No. 9', 'Classical masterpiece on 180g vinyl', 24.99, 12, 7, 'Deutsche Grammophon', 'VINYL-LVB-SYM9', 0),
('Kendrick Lamar - To Pimp a Butterfly', 'Grammy-winning hip hop album on 180g vinyl', 32.99, 13, 12, 'Kendrick Lamar', 'VINYL-KL-TPAB', 1);

-- Insert product attributes
INSERT INTO product_attributes (product_id, attribute_name, attribute_value) VALUES
(1, 'Body Material', 'Alder'),
(1, 'Neck Material', 'Maple'),
(1, 'Fretboard', 'Maple'),
(1, 'Pickups', '3 Single-coil'),
(2, 'Body Material', 'Mahogany'),
(2, 'Top Material', 'Maple'),
(2, 'Neck Material', 'Mahogany'),
(2, 'Pickups', '2 Humbuckers'),
(3, 'Top', 'Solid Spruce'),
(3, 'Back and Sides', 'Rosewood'),
(3, 'Neck', 'Mahogany'),
(5, 'Artist', 'Pink Floyd'),
(5, 'Release Year', '1973'),
(5, 'Genre', 'Progressive Rock'),
(5, 'Condition', 'Used' )