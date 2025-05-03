export default {
  async check(ctx) {
    return {
      status: 'success',
      message: 'API is running',
      timestamp: new Date().toISOString()
    }
  }
} 