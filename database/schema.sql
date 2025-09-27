DROP DATABASE IF EXISTS med_assist;

CREATE DATABASE med_assist;
USE med_assist;

CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
    );

CREATE TABLE user_info(
    user_info_id INT AUTO_INCREMENT PRIMARY KEY,
    id INT NOT NULL,
    age INT,
    gender VARCHAR(10),
    weight_lbs FLOAT,
    height_ft FLOAT,
    current_diagnoses VARCHAR(1000),
    medical_history VARCHAR(1000),
    FOREIGN KEY (id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE daily_symptoms (
    symptoms_id INT AUTO_INCREMENT PRIMARY KEY,
    id INT NOT NULL,
    severity INT,
    type_of_symptom VARCHAR(20),
    weight_lbs FLOAT,
    notes VARCHAR(1000),
    FOREIGN KEY (id) REFERENCES user(id) ON DELETE CASCADE
);

--log daily food intake to track symptom reactions related to food
CREATE TABLE food_log (
    foodlog_id INT AUTO_INCREMENT PRIMARY KEY,
    id INT NOT NULL,
    breakfast VARCHAR(100),
    lunch VARCHAR(100),
    dinner VARCHAR(100),
    notes VARCHAR(1000),
    total calories FLOAT,
    FOREIGN KEY (id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE labs (
    lab_id INT AUTO_INCREMENT PRIMARY KEY,
    id INT NOT NULL,
    bloodpressure VARCHAR(100)
    FOREIGN KEY (id) REFERENCES user(id) ON DELETE CASCADE
    --not finished

);

CREATE TABLE token_blocklist(
    id INT AUTO_INCREMENT PRIMARY KEY,
    jti VARCHAR(64) NOT NULL,
    create_at DATETIME

);

CREATE TABLE ()
