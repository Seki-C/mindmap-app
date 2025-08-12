import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, mean_absolute_error
import joblib
import os

def load_data(train_path, test_path=None):
    train_df = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path) if test_path else None
    return train_df, test_df

def train_model(X_train, y_train, model, cv=5):
    scores = cross_val_score(model, X_train, y_train, cv=cv, scoring='neg_mean_squared_error')
    model.fit(X_train, y_train)
    return model, -scores.mean()

def save_model(model, filepath):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    joblib.dump(model, filepath)
    print(f"Model saved to {filepath}")

def create_submission(model, test_df, feature_cols, submission_path):
    X_test = test_df[feature_cols]
    predictions = model.predict(X_test)
    
    submission = pd.DataFrame({
        'id': test_df['id'],
        'target': predictions
    })
    
    submission.to_csv(submission_path, index=False)
    print(f"Submission saved to {submission_path}")
    
    return submission

if __name__ == "__main__":
    print("Training pipeline ready")