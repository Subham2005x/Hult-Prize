from datetime import datetime
from typing import Optional


class WageCalculator:
    """Calculate wages, withdrawable amounts, and limits"""
    
    @staticmethod
    def calculate_available_balance(
        total_earned: float,
        total_withdrawn: float,
        max_percentage: int = 40
    ) -> dict:
        """
        Calculate available withdrawal balance
        
        Args:
            total_earned: Total earned this month
            total_withdrawn: Total already withdrawn this month
            max_percentage: Maximum percentage allowed to withdraw (30-50%)
        
        Returns:
            {
                "total_earned": float,
                "total_withdrawn": float,
                "max_withdrawable": float,
                "available_to_withdraw": float
            }
        """
        max_withdrawable = (total_earned * max_percentage) / 100
        available = max(0, max_withdrawable - total_withdrawn)
        
        return {
            "total_earned": round(total_earned, 2),
            "total_withdrawn": round(total_withdrawn, 2),
            "max_withdrawable": round(max_withdrawable, 2),
            "available_to_withdraw": round(available, 2)
        }
    
    @staticmethod
    def validate_withdrawal_amount(
        amount: float,
        available_balance: float,
        min_amount: int = 100,
        max_amount: int = 10000
    ) -> tuple[bool, Optional[str]]:
        """
        Validate withdrawal amount
        
        Returns:
            (is_valid, error_message)
        """
        if amount < min_amount:
            return False, f"Minimum withdrawal amount is ₹{min_amount}"
        
        if amount > max_amount:
            return False, f"Maximum withdrawal amount is ₹{max_amount}"
        
        if amount > available_balance:
            return False, f"Insufficient balance. Available: ₹{available_balance}"
        
        return True, None
    
    @staticmethod
    def calculate_daily_earnings(
        hours_worked: float,
        wage_per_hour: float
    ) -> float:
        """Calculate earnings for a day"""
        return round(hours_worked * wage_per_hour, 2)
    
    @staticmethod
    def get_next_payday(payday_date: int) -> datetime:
        """
        Get next payday datetime
        
        Args:
            payday_date: Day of month (1-31)
        
        Returns:
            Next payday datetime
        """
        from datetime import datetime
        from dateutil.relativedelta import relativedelta
        
        now = datetime.utcnow()
        current_month_payday = datetime(now.year, now.month, min(payday_date, 28))
        
        if now.day >= payday_date:
            # Next payday is next month
            next_payday = current_month_payday + relativedelta(months=1)
        else:
            # Next payday is this month
            next_payday = current_month_payday
        
        return next_payday


wage_calculator = WageCalculator()
