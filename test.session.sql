-- @block
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(63) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
)
