-- Starter category tree. Top-level categories first, then subcategories.

INSERT INTO categories (name) VALUES
    ('Electronics'),
    ('Fashion'),
    ('Home & Kitchen'),
    ('Groceries'),
    ('Travel'),
    ('Credit Cards & Banking'),
    ('Health & Beauty'),
    ('Toys & Games');

INSERT INTO categories (name, parent_category_id) VALUES
    ('Laptops & Computers', (SELECT id FROM categories WHERE name = 'Electronics')),
    ('Phones & Accessories', (SELECT id FROM categories WHERE name = 'Electronics')),
    ('TVs & Audio',          (SELECT id FROM categories WHERE name = 'Electronics')),
    ('Men',                  (SELECT id FROM categories WHERE name = 'Fashion')),
    ('Women',                (SELECT id FROM categories WHERE name = 'Fashion')),
    ('Shoes',                (SELECT id FROM categories WHERE name = 'Fashion')),
    ('Flights',              (SELECT id FROM categories WHERE name = 'Travel')),
    ('Hotels',               (SELECT id FROM categories WHERE name = 'Travel')),
    ('Cash Back Cards',      (SELECT id FROM categories WHERE name = 'Credit Cards & Banking')),
    ('Travel Rewards Cards', (SELECT id FROM categories WHERE name = 'Credit Cards & Banking')),
    ('Bank Bonuses',         (SELECT id FROM categories WHERE name = 'Credit Cards & Banking'));
