# Customer Churn Prediction using Machine Learning

## Overview

Customer churn is one of the most critical challenges faced by businesses in industries such as telecommunications, banking, insurance, and e-commerce. Predicting whether a customer is likely to leave a service helps organizations improve customer retention and reduce revenue loss.

This project uses Machine Learning techniques to predict customer churn based on customer demographics, account information, and service usage patterns.

---

## Project Objectives

* Analyze customer behavior and service usage.
* Identify factors contributing to customer churn.
* Build and compare multiple Machine Learning models.
* Predict whether a customer will churn or remain with the company.
* Evaluate model performance using classification metrics.

---

## Dataset

Dataset: Telco Customer Churn Dataset

Features include:

* Gender
* Senior Citizen
* Partner
* Dependents
* Tenure
* Phone Service
* Internet Service
* Online Security
* Online Backup
* Device Protection
* Tech Support
* Streaming TV
* Streaming Movies
* Contract Type
* Payment Method
* Monthly Charges
* Total Charges

Target Variable:

* Churn = Yes (Customer Leaves)
* Churn = No (Customer Stays)

---

## Technologies Used

* Python
* Pandas
* NumPy
* Matplotlib
* Seaborn
* Scikit-Learn
* Google Colab

---

## Machine Learning Models

The following classification models were trained and evaluated:

1. Logistic Regression
2. Decision Tree Classifier
3. Random Forest Classifier

---

## Project Workflow

1. Data Collection
2. Data Cleaning
3. Missing Value Handling
4. Feature Encoding
5. Exploratory Data Analysis (EDA)
6. Train-Test Split
7. Model Training
8. Model Evaluation
9. Feature Importance Analysis
10. Model Saving

---

## Results

| Model               | Accuracy |
| ------------------- | -------- |
| Logistic Regression | 81.62%   |
| Decision Tree       | 72.53%   |
| Random Forest       | 79.56%   |

Best Performing Model:

**Logistic Regression – 81.62% Accuracy**

---

## Evaluation Metrics

The project uses:

* Accuracy Score
* Precision
* Recall
* F1 Score
* Confusion Matrix

---

## Feature Importance

The analysis revealed that the following factors have significant influence on customer churn:

* Contract Type
* Tenure
* Monthly Charges
* Total Charges
* Internet Service

---

## Project Structure

```text
Customer-Churn-Prediction/
│
├── WA_Fn-UseC_-Telco-Customer-Churn.csv
├── Customer_Churn_Prediction.ipynb
├── churn_model.pkl
├── README.md
└── images/
```

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/customer-churn-prediction.git
```

Move into the project directory:

```bash
cd customer-churn-prediction
```

Install required packages:

```bash
pip install pandas numpy matplotlib seaborn scikit-learn
```

---

## Running the Project

Open the notebook:

```bash
jupyter notebook
```

or run the project directly in Google Colab.

---

## Future Improvements

* Hyperparameter Tuning
* ROC Curve Analysis
* SMOTE for Class Imbalance Handling
* XGBoost Implementation
* Streamlit Web Application
* Deployment on Cloud Platforms

---

## Learning Outcomes

Through this project, I gained practical experience in:

* Data Preprocessing
* Exploratory Data Analysis
* Feature Engineering
* Classification Algorithms
* Model Evaluation
* Machine Learning Workflow

---

## Author

Ganesh

B.Tech Data Science Student

Machine Learning | Data Analytics | Python Development

---

