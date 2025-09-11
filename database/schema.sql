DROP DATABASE IF EXISTS med_assist;

CREATE DATABASE med_assist;
USE med_assist;

CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    age INT,
    gender VARCHAR(10),
    weight_lbs FLOAT,
    height_ft FLOAT,
    current_diagnoses VARCHAR(1000),
    medical_history VARCHAR(1000),
    );

CREATE TABLE daily_symptoms (
    severity VARCHAR(20)
    type VARCHAR(20)
    weight_lbs FLOAT
    notes VARCHAR(1000)
);

--log daily food intake to track symptom reactions related to food
CREATE TABLE food_log (
    breakfast VARCHAR(100)
    lunch VARCHAR(100)
    dinner VARCHAR(100)
    notes VARCHAR(1000)
    total calories FLOAT
);

CREATE TABLE labs (
    bloodpressure VARCHAR(100)
    --not finished

);

CREATE TABLE ()
