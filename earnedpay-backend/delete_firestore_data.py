"""
Script to delete old Firestore data after migrating to MongoDB Atlas
Run this ONLY after verifying MongoDB is working correctly!
"""

import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Firebase
firebase_creds = json.loads(os.getenv('FIREBASE_CREDENTIALS'))
cred = credentials.Certificate(firebase_creds)

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

def delete_collection(collection_name):
    """Delete all documents in a collection"""
    print(f"\n🗑️  Deleting {collection_name} collection...")
    
    docs = db.collection(collection_name).stream()
    deleted_count = 0
    
    for doc in docs:
        doc.reference.delete()
        deleted_count += 1
        print(f"   Deleted {doc.id}")
    
    print(f"✅ Deleted {deleted_count} documents from {collection_name}")
    return deleted_count

def main():
    print("=" * 60)
    print("🔥 FIRESTORE DATA CLEANUP SCRIPT")
    print("=" * 60)
    print("\n⚠️  WARNING: This will DELETE all data from Firestore!")
    print("   Make sure MongoDB is working correctly before proceeding.")
    print("\nCollections to be deleted:")
    print("   - workers")
    print("   - wage_ledgers")
    print("   - attendance")
    print("   - employers")
    print("   - withdrawals")
    print("   - settlements")
    print("\nCollections that will be KEPT:")
    print("   - users (Firebase Auth still uses this)")
    
    confirm = input("\n❓ Type 'DELETE' to confirm: ")
    
    if confirm != "DELETE":
        print("\n❌ Cancelled. No data was deleted.")
        return
    
    print("\n🚀 Starting deletion...")
    
    # Delete collections
    total_deleted = 0
    total_deleted += delete_collection('workers')
    total_deleted += delete_collection('wage_ledgers')
    total_deleted += delete_collection('attendance')
    total_deleted += delete_collection('employers')
    total_deleted += delete_collection('withdrawals')
    total_deleted += delete_collection('settlements')
    
    print("\n" + "=" * 60)
    print(f"✅ CLEANUP COMPLETE!")
    print(f"   Total documents deleted: {total_deleted}")
    print("=" * 60)
    print("\n📝 Next steps:")
    print("   1. Your app now uses MongoDB Atlas for data")
    print("   2. Firebase Auth is still active for authentication")
    print("   3. Test all endpoints to verify everything works")
    print("\n🎉 Migration complete!")

if __name__ == "__main__":
    main()
