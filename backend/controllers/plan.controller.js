import db from '../config/db.js';

export class PlanController {
  /**
   * Get all plans with optional filtering by operator and features
   */
  static async getAllPlans(req, res) {
    try {
      const { operator, popularOnly, minPrice, maxPrice } = req.query;
      let plans = db.find('plans');

      if (operator && operator.toLowerCase() !== 'all') {
        plans = plans.filter(p => p.operator.toLowerCase() === operator.toLowerCase());
      }

      if (popularOnly === 'true') {
        plans = plans.filter(p => p.is_popular);
      }

      if (minPrice) {
        plans = plans.filter(p => p.price >= parseFloat(minPrice));
      }

      if (maxPrice) {
        plans = plans.filter(p => p.price <= parseFloat(maxPrice));
      }

      // Group operators for easy UI filtering
      const operators = [...new Set(db.find('plans').map(p => p.operator))];

      return res.json({
        success: true,
        count: plans.length,
        operators,
        plans
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve telecom plans.' });
    }
  }

  /**
   * Get specific plan details
   */
  static async getPlanById(req, res) {
    try {
      const { id } = req.params;
      const plan = db.findById('plans', id);

      if (!plan) {
        return res.status(404).json({ success: false, message: 'Telecom plan not found.' });
      }

      return res.json({ success: true, plan });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve plan details.' });
    }
  }
}

export default PlanController;
