var paySlip;

paySlip = {
  form: '#PaySlipForm',
  resultContainer: '#paySlipResults',
  errorBox: "#error",
  errors: {
    firstName: "Please enter the first name",
    lastName: "Please enter the last name",
    salary: ["Please enter the annual salary", "Please enter a valid annual salary format"],
    super: ["Please enter the super rate", "Please enter a valid super rate format"],
    month: "Please select payment period",
  },
  result: { name: "",pay_period:"",gross_income: 0, income_tax: 0, net_income: 0, super: 0},
  Utils: {
    fullInteger: function(n){
      return parseInt((n.toString()).replace(",",""));
    },

    checkRange: function(x, n, m) {
        if (x >= n && x <= m) { return x; }
        else { return !x; }
    },
    formatMoney: function(m){
     return  "$ " + m.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
   },

    calculateTax: function(salary, minRange, defaultTax, perc){
      return Math.round((((salary - minRange) * perc * 0.01) + defaultTax)/12);
    },

    getSuper: function(super_rate){
      var grossIncome = paySlip.result.gross_income;
      paySlip.result.super = Math.round(grossIncome * 0.01 * parseInt(super_rate));
    },

    getNetIncome: function(){
      paySlip.result.net_income = paySlip.result.gross_income - paySlip.result.income_tax;
    },

    getIncomeTax: function(salary){
      var s = paySlip.Utils.fullInteger(salary);
      var tax;
      switch(s){
        case paySlip.Utils.checkRange(s, 0, 18200 ) :
          tax = 0;
          break;
        case paySlip.Utils.checkRange(s, 18201, 37000 ):
          tax = paySlip.Utils.calculateTax(s, 18200, 0, 19);
          break;
        case paySlip.Utils.checkRange(s, 37001, 80000 ):
          tax = paySlip.Utils.calculateTax(s, 37000, 3572, 32.5);
          break;
        case paySlip.Utils.checkRange(s, 80001, 180000 ):
          tax = paySlip.Utils.calculateTax(s, 80000, 17547, 37);
          break;
        default :
          tax = paySlip.Utils.calculateTax(s, 180000, 54547, 45);
          break;
      }
      paySlip.result.income_tax = tax;

    },
    getGrossIncome: function(salary){
      var s = paySlip.Utils.fullInteger(salary);
      paySlip.result.gross_income = Math.round(s /12);
    },
    getDateRange: function(m){
      var date = new Date();
      y = date.getFullYear();
      var firstDay = (new Date(y, m-1, 1)+"").split(' ');
      var lastDay = (new Date(y, m , 0)+"").split(' ');
      paySlip.result.pay_period = firstDay[2]+" "+firstDay[1]+" - "+lastDay[2]+" "+lastDay[1];
    },
    getFullName:function(firstname, lastname){
      paySlip.result.name = firstname +" "+lastname;
    },
    checkNumeric : function(n){
        var filter = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
        var n = paySlip.Utils.fullInteger(n);
        return filter.test(n);
    }
  },

  _displayTable: function(){
    var table = $(this.resultContainer);
    table.find('td.name').html(this.result.name);
    table.find('td.pay_period').html(this.result.pay_period);
    table.find('td.gross_income').html(this.Utils.formatMoney(this.result.gross_income) );
    table.find('td.income_tax').html(this.Utils.formatMoney(this.result.income_tax) );
    table.find('td.net_income').html(this.Utils.formatMoney(this.result.net_income) );
    table.find('td.super').html(this.Utils.formatMoney(this.result.super) );
    table.show();
  },

  _serializeForm: function(formArray){

    this.Utils.getFullName(formArray[0]['value'], formArray[1]['value']);
    this.Utils.getDateRange(formArray[4]['value']);
    this.Utils.getGrossIncome(formArray[2]['value']);
    this.Utils.getIncomeTax(formArray[2]['value']);
    this.Utils.getNetIncome();
    this.Utils.getSuper(formArray[3]['value']);
  },
  _checkForm: function(formArray){
    if(formArray[0]['value'] == ""){
      $(this.errorBox).addClass('show').html(this.errors.firstName);
      return false;
    }
    if(formArray[1]['value'] == ""){
      $(this.errorBox).addClass('show').html(this.errors.lastName);
      return false;
    }
    if(formArray[2]['value'] == ""){
      $(this.errorBox).addClass('show').html(this.errors.salary[0]);
      return false;
    }
    if(!this.Utils.checkNumeric(formArray[2]['value'])){
      $(this.errorBox).addClass('show').html(this.errors.salary[1]);
      return false;
    }

    if(formArray[3]['value'] == ''){
      $(this.errorBox).addClass('show').html(this.errors.super[0]);
      return false;
    }
    if(!this.Utils.checkNumeric(formArray[3]['value'])){
      $(this.errorBox).addClass('show').html(this.errors.super[1]);
      return false;
    }

    if(formArray[4]['value'] == 'Select payment period'){
      $(this.errorBox).addClass('show').html(this.errors.month);
      return false;
    }
    $(this.errorBox).removeClass('show');
    return true;
  }

};

$(document).ready(function(){
  var date = new Date();
  $(paySlip.form).submit(function(e){
    e.preventDefault();
    var formArray = $(this).serializeArray();
    if( paySlip._checkForm(formArray)){
      paySlip._serializeForm(formArray);
      paySlip._displayTable();
    }

  });
});
