# ==========================
# CUSTOMER CHURN PREDICTION
# COMPLETE PROJECT
# ==========================

# Upload Dataset
from google.colab import files
uploaded = files.upload()

# Import Libraries
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    classification_report
)

# Load Dataset
filename = list(uploaded.keys())[0]

df = pd.read_csv(filename)

print("Dataset Loaded Successfully")
print(df.head())

# ==========================
# DATA CLEANING
# ==========================

if "customerID" in df.columns:
    df.drop("customerID", axis=1, inplace=True)

if "TotalCharges" in df.columns:
    df["TotalCharges"] = pd.to_numeric(
        df["TotalCharges"],
        errors="coerce"
    )

    df["TotalCharges"].fillna(
        df["TotalCharges"].median(),
        inplace=True
    )

# ==========================
# BASIC INFO
# ==========================

print("\nDataset Shape:")
print(df.shape)

print("\nMissing Values:")
print(df.isnull().sum())

# ==========================
# VISUALIZATION
# ==========================

plt.figure(figsize=(5,4))
sns.countplot(x="Churn", data=df)
plt.title("Churn Distribution")
plt.show()

# ==========================
# ENCODING
# ==========================

le = LabelEncoder()

for col in df.columns:
    if df[col].dtype == "object":
        df[col] = le.fit_transform(df[col])

# ==========================
# SPLIT DATA
# ==========================

X = df.drop("Churn", axis=1)
y = df["Churn"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# ==========================
# LOGISTIC REGRESSION
# ==========================

lr = LogisticRegression(max_iter=1000)

lr.fit(X_train, y_train)

pred_lr = lr.predict(X_test)

lr_acc = accuracy_score(y_test, pred_lr)

# ==========================
# DECISION TREE
# ==========================

dt = DecisionTreeClassifier(random_state=42)

dt.fit(X_train, y_train)

pred_dt = dt.predict(X_test)

dt_acc = accuracy_score(y_test, pred_dt)

# ==========================
# RANDOM FOREST
# ==========================

rf = RandomForestClassifier(random_state=42)

rf.fit(X_train, y_train)

pred_rf = rf.predict(X_test)

rf_acc = accuracy_score(y_test, pred_rf)

# ==========================
# MODEL COMPARISON
# ==========================

print("\nMODEL ACCURACIES")
print("--------------------")
print("Logistic Regression :", round(lr_acc*100,2), "%")
print("Decision Tree       :", round(dt_acc*100,2), "%")
print("Random Forest       :", round(rf_acc*100,2), "%")

# ==========================
# CLASSIFICATION REPORT
# ==========================

print("\nRandom Forest Report")
print(classification_report(y_test, pred_rf))

# ==========================
# CONFUSION MATRIX
# ==========================

cm = confusion_matrix(y_test, pred_rf)

plt.figure(figsize=(6,4))
sns.heatmap(
    cm,
    annot=True,
    fmt='d'
)

plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix")
plt.show()

# ==========================
# FEATURE IMPORTANCE
# ==========================

importance = rf.feature_importances_

feature_imp = pd.Series(
    importance,
    index=X.columns
).sort_values(ascending=False)

plt.figure(figsize=(10,6))

sns.barplot(
    x=feature_imp.values,
    y=feature_imp.index
)

plt.title("Feature Importance")
plt.show()

# ==========================
# SAVE MODEL
# ==========================

import pickle

pickle.dump(
    rf,
    open("churn_model.pkl", "wb")
)

print("\nModel Saved Successfully")