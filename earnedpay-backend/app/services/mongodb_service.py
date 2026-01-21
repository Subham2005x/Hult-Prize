from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from typing import Optional, List
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class MongoDBService:
    """MongoDB Atlas service for data storage (Firebase Auth still used for authentication)"""
    
    def __init__(self):
        self.client = None
        self.db = None
        self._initialize()
    
    def _initialize(self):
        """Initialize MongoDB connection"""
        try:
            self.client = AsyncIOMotorClient(settings.mongodb_url)
            self.db = self.client.earnedpay
            logger.info("MongoDB Atlas connected successfully")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    # ============ USERS ============
    
    async def get_user(self, firebase_uid: str) -> Optional[dict]:
        """Get user by Firebase UID"""
        try:
            user = await self.db.users.find_one({"_id": firebase_uid})
            if user:
                # Add 'uid' field for backward compatibility
                user['uid'] = user['_id']
            return user
        except Exception as e:
            logger.error(f"Error getting user {firebase_uid}: {e}")
            return None
    
    async def create_user(self, firebase_uid: str, user_data: dict) -> str:
        """Create user with Firebase UID as _id"""
        try:
            user_doc = {
                "_id": firebase_uid,
                "phoneNumber": user_data.get("phone_number"),
                "role": user_data.get("role"),
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
            await self.db.users.insert_one(user_doc)
            logger.info(f"Created user {firebase_uid}")
            return firebase_uid
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise
    
    async def update_user(self, firebase_uid: str, update_data: dict) -> bool:
        """Update user document"""
        try:
            update_data["updatedAt"] = datetime.utcnow()
            result = await self.db.users.update_one(
                {"_id": firebase_uid},
                {"$set": update_data}
            )
            return result.acknowledged
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            return False
    
    # ============ WORKERS ============
    
    async def get_worker(self, firebase_uid: str) -> Optional[dict]:
        """Get worker by Firebase UID"""
        try:
            return await self.db.workers.find_one({"_id": firebase_uid})
        except Exception as e:
            logger.error(f"Error getting worker {firebase_uid}: {e}")
            return None
    
    async def create_worker(self, firebase_uid: str, worker_data: dict) -> str:
        """Create worker with Firebase UID as _id"""
        try:
            worker_doc = {
                "_id": firebase_uid,
                "employerId": worker_data.get("employer_id"),
                "fullName": worker_data.get("full_name"),
                "phoneNumber": worker_data.get("phone_number"),
                "upiId": worker_data.get("upi_id"),
                "joinedAt": datetime.utcnow(),
                "isActive": True,
                "currentMonthEarnings": 0.0,
                "totalWithdrawn": 0.0,
                "employerVerified": True,
                "verificationMethod": "employer_payroll"
            }
            await self.db.workers.insert_one(worker_doc)
            logger.info(f"Created worker {firebase_uid}")
            return firebase_uid
        except Exception as e:
            logger.error(f"Error creating worker: {e}")
            raise
    
    async def update_worker(self, firebase_uid: str, update_data: dict) -> bool:
        """Update worker document"""
        try:
            result = await self.db.workers.update_one(
                {"_id": firebase_uid},
                {"$set": update_data}
            )
            return result.acknowledged
        except Exception as e:
            logger.error(f"Error updating worker: {e}")
            return False
    
    async def get_employer_workers(self, employer_id: str) -> List[dict]:
        """Get all workers for an employer"""
        try:
            cursor = self.db.workers.find({"employerId": employer_id, "isActive": True})
            return await cursor.to_list(length=1000)
        except Exception as e:
            logger.error(f"Error getting employer workers: {e}")
            return []
    
    async def delete_worker(self, firebase_uid: str) -> bool:
        """Soft delete worker (set isActive to False)"""
        try:
            result = await self.db.workers.update_one(
                {"_id": firebase_uid},
                {"$set": {"isActive": False}}
            )
            return result.acknowledged
        except Exception as e:
            logger.error(f"Error deleting worker: {e}")
            return False
    
    # ============ WAGE LEDGERS ============
    
    async def get_wage_ledger(self, worker_id: str) -> Optional[dict]:
        """Get wage ledger for worker"""
        try:
            return await self.db.wage_ledgers.find_one({"workerId": worker_id})
        except Exception as e:
            logger.error(f"Error getting wage ledger: {e}")
            return None
    
    async def create_wage_ledger(self, worker_id: str, employer_id: str) -> bool:
        """Create initial wage ledger for worker"""
        try:
            ledger_doc = {
                "workerId": worker_id,
                "employerId": employer_id,
                "totalEarned": 0.0,
                "totalWithdrawn": 0.0,
                "availableBalance": 0.0,
                "lastUpdated": datetime.utcnow()
            }
            await self.db.wage_ledgers.insert_one(ledger_doc)
            logger.info(f"Created wage ledger for worker {worker_id}")
            return True
        except Exception as e:
            logger.error(f"Error creating wage ledger: {e}")
            return False
    
    async def update_wage_ledger(self, worker_id: str, update_data: dict) -> bool:
        """Update or create wage ledger"""
        try:
            update_data["lastUpdated"] = datetime.utcnow()
            result = await self.db.wage_ledgers.update_one(
                {"workerId": worker_id},
                {"$set": update_data},
                upsert=True
            )
            return result.acknowledged
        except Exception as e:
            logger.error(f"Error updating wage ledger: {e}")
            return False
    
    async def increment_earnings(self, worker_id: str, amount: float) -> bool:
        """Add to worker's earnings (atomic operation)"""
        try:
            result = await self.db.wage_ledgers.update_one(
                {"workerId": worker_id},
                {
                    "$inc": {
                        "totalEarned": amount,
                        "availableBalance": amount
                    },
                    "$set": {"lastUpdated": datetime.utcnow()}
                },
                upsert=True
            )
            logger.info(f"Incremented earnings for {worker_id} by {amount}")
            return result.acknowledged
        except Exception as e:
            logger.error(f"Error incrementing earnings: {e}")
            return False
    
    async def record_withdrawal(self, worker_id: str, amount: float) -> bool:
        """Record withdrawal (atomic operation)"""
        try:
            result = await self.db.wage_ledgers.update_one(
                {"workerId": worker_id},
                {
                    "$inc": {
                        "totalWithdrawn": amount,
                        "availableBalance": -amount
                    },
                    "$set": {"lastUpdated": datetime.utcnow()}
                }
            )
            return result.acknowledged
        except Exception as e:
            logger.error(f"Error recording withdrawal: {e}")
            return False
    
    # ============ ATTENDANCE ============
    
    async def add_attendance(self, attendance_data: dict) -> str:
        """Add attendance record"""
        try:
            attendance_doc = {
                "workerId": attendance_data.get("worker_id"),
                "employerId": attendance_data.get("employer_id"),
                "date": attendance_data.get("date", datetime.utcnow()),
                "hoursWorked": attendance_data.get("hours_worked"),
                "wagePerHour": attendance_data.get("wage_per_hour"),
                "totalEarned": attendance_data.get("total_earned"),
                "createdAt": datetime.utcnow()
            }
            result = await self.db.attendance.insert_one(attendance_doc)
            logger.info(f"Added attendance for worker {attendance_data.get('worker_id')}")
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Error adding attendance: {e}")
            raise
    
    async def get_worker_attendance(self, worker_id: str, limit: int = 30) -> List[dict]:
        """Get recent attendance for worker"""
        try:
            cursor = self.db.attendance.find(
                {"workerId": worker_id}
            ).sort("date", -1).limit(limit)
            return await cursor.to_list(length=limit)
        except Exception as e:
            logger.error(f"Error getting attendance: {e}")
            return []
    
    async def get_employer_attendance(self, employer_id: str, limit: int = 100) -> List[dict]:
        """Get attendance records for employer"""
        try:
            cursor = self.db.attendance.find(
                {"employerId": employer_id}
            ).sort("date", -1).limit(limit)
            return await cursor.to_list(length=limit)
        except Exception as e:
            logger.error(f"Error getting employer attendance: {e}")
            return []
    
    # ============ EMPLOYERS ============
    
    async def get_employer(self, firebase_uid: str) -> Optional[dict]:
        """Get employer by Firebase UID"""
        try:
            return await self.db.employers.find_one({"_id": firebase_uid})
        except Exception as e:
            logger.error(f"Error getting employer: {e}")
            return None
    
    async def create_employer(self, firebase_uid: str, employer_data: dict) -> str:
        """Create employer with Firebase UID as _id"""
        try:
            employer_doc = {
                "_id": firebase_uid,
                "companyName": employer_data.get("company_name"),
                "contactPerson": employer_data.get("contact_person"),
                "email": employer_data.get("email"),
                "walletBalance": 0.0,
                "createdAt": datetime.utcnow()
            }
            await self.db.employers.insert_one(employer_doc)
            logger.info(f"Created employer {firebase_uid}")
            return firebase_uid
        except Exception as e:
            logger.error(f"Error creating employer: {e}")
            raise
    
    async def update_employer(self, firebase_uid: str, update_data: dict) -> bool:
        """Update employer document"""
        try:
            result = await self.db.employers.update_one(
                {"_id": firebase_uid},
                {"$set": update_data}
            )
            return result.acknowledged
        except Exception as e:
            logger.error(f"Error updating employer: {e}")
            return False
    
    # ============ WITHDRAWALS ============
    
    async def create_withdrawal(self, withdrawal_data: dict) -> str:
        """Create withdrawal request"""
        try:
            withdrawal_doc = {
                "workerId": withdrawal_data.get("worker_id"),
                "amount": withdrawal_data.get("amount"),
                "upiId": withdrawal_data.get("upi_id"),
                "status": withdrawal_data.get("status", "pending"),
                "razorpayPayoutId": withdrawal_data.get("razorpay_payout_id"),
                "createdAt": datetime.utcnow(),
                "completedAt": withdrawal_data.get("completed_at")
            }
            result = await self.db.withdrawals.insert_one(withdrawal_doc)
            logger.info(f"Created withdrawal for worker {withdrawal_data.get('worker_id')}")
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Error creating withdrawal: {e}")
            raise
    
    async def update_withdrawal(self, withdrawal_id: str, update_data: dict) -> bool:
        """Update withdrawal status"""
        try:
            from bson import ObjectId
            result = await self.db.withdrawals.update_one(
                {"_id": ObjectId(withdrawal_id)},
                {"$set": update_data}
            )
            return result.acknowledged
        except Exception as e:
            logger.error(f"Error updating withdrawal: {e}")
            return False
    
    async def get_worker_withdrawals(self, worker_id: str) -> List[dict]:
        """Get withdrawal history for worker"""
        try:
            cursor = self.db.withdrawals.find(
                {"workerId": worker_id}
            ).sort("createdAt", -1)
            withdrawals = await cursor.to_list(length=100)
            # Convert ObjectId to string for JSON serialization
            for w in withdrawals:
                w['_id'] = str(w['_id'])
            return withdrawals
        except Exception as e:
            logger.error(f"Error getting withdrawals: {e}")
            return []
    
    # ============ SETTLEMENTS ============
    
    async def create_settlement(self, settlement_data: dict) -> str:
        """Create settlement record"""
        try:
            settlement_doc = {
                "employerId": settlement_data.get("employer_id"),
                "amount": settlement_data.get("amount"),
                "status": settlement_data.get("status", "pending"),
                "razorpayOrderId": settlement_data.get("razorpay_order_id"),
                "createdAt": datetime.utcnow(),
                "completedAt": settlement_data.get("completed_at")
            }
            result = await self.db.settlements.insert_one(settlement_doc)
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Error creating settlement: {e}")
            raise
    
    async def update_settlement(self, settlement_id: str, update_data: dict) -> bool:
        """Update settlement status"""
        try:
            from bson import ObjectId
            result = await self.db.settlements.update_one(
                {"_id": ObjectId(settlement_id)},
                {"$set": update_data}
            )
            return result.acknowledged
        except Exception as e:
            logger.error(f"Error updating settlement: {e}")
            return False


# Singleton instance
mongodb_service = MongoDBService()
