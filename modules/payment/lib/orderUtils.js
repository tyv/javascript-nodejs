module.exports = {
  getSuccessUrl: function(order) {
    return '/' + order.module + '/success/' + order.number;
  },
  getUrl:        function(order) {
    return '/' + order.module + '/order/' + order.number;
  },
  getPendingUrl: function(order) {
    return '/' + order.module + '/pending/' + order.number;
  }
};
