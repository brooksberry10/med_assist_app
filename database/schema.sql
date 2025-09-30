
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE user_info(
    user_info_id BIGSERIAL PRIMARY KEY,
    id BIGINT NOT NULL,
    age INT,
    gender VARCHAR(10),
    weight_lbs FLOAT,
    height_ft INT,
    height_inch INT,
    current_diagnoses TEXT,
    medical_history TEXT,
	insurance TEXT,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE daily_symptoms (
    symptoms_id BIGSERIAL PRIMARY KEY,
    id BIGINT NOT NULL,
    severity INT CHECK (severity BETWEEN 0 AND 10),
    type_of_symptom VARCHAR(100),
    weight_lbs FLOAT,
    notes TEXT,
	recorded_on DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE treatments (
    treatment_id BIGSERIAL PRIMARY KEY,
    id BIGINT NOT NULL,
    treatment_name VARCHAR(100),
    scheduled_on DATE NOT NULL,
    notes TEXT,
    is_completed BOOLEAN DEFAULT false,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

--log daily food intake to track symptom reactions related to food
CREATE TABLE food_log (
    foodlog_id BIGSERIAL PRIMARY KEY,
    id BIGINT NOT NULL,
    breakfast VARCHAR(100),
    lunch VARCHAR(100),
    dinner VARCHAR(100),
    notes TEXT,
    total_calories FLOAT,
	recorded_on DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
    foodlog_id BIGSERIAL PRIMARY KEY,
    id BIGINT NOT NULL,
    breakfast VARCHAR(100),
    lunch VARCHAR(100),
    dinner VARCHAR(100),
    notes TEXT,
    total_calories FLOAT,
	recorded_on DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE labs (
    lab_id BIGSERIAL PRIMARY KEY,
    id BIGINT NOT NULL,
    -- Both systolic and diastolic are needed to calculate blood pressure --
    systolic_pressure INT,
    diastolic_pressure INT
	rbc_count FLOAT,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
    --not finished

);
