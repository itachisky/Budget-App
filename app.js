// Budget data controller
var budgetData = (function () {

    // Constructor for expense data
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        
        if ( totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    // Constructor for income data
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allitems[type].forEach(function(curr){
            sum = sum + curr.value;
        });

        data.totals[type] = sum;
    };

    // object for handling incomes and expenses
    var data = {
        allitems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        additem: function(type, desc, val){
            var newItem, ID;

            if (data.allitems[type].length > 0) {
                ID = data.allitems[type][data.allitems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }

            data.allitems[type].push(newItem);

            return newItem;
        },

        deleteItem: function(type, id) {

            // difference map and foreach is that map returns a brand new array
            var ids = data.allitems[type].map(function(current){
                return current.id;
            });
            var index = ids.indexOf(id);

            if (index !== -1) {
                // splice is used to remove the element. first parameter is index and second is
                // how many elements to remove from that element
                data.allitems[type].splice(index, 1);
            }

        },

        calculateBudget: function() {
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);    
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentage: function() {
            data.allitems.exp.forEach(function(curr){
                curr.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPercentages = data.allitems.exp.map(function(cur){
                return cur.getPercentage();
            });

            return allPercentages;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }
    };

})();


// UI controller
var budgetUi = (function () {
    
    // all classes from html are at this object.
    var DOMvars = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        container: '.container',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        expenseLabelPercentage: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
 
    var nodeListForEach = function(list, callback){
        for (var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    var formatNumber =  function(num, type) {
        var type, sign;

        var num = Math.abs(num);
        // for two decimel points
        num = num.toFixed(2);

        var numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    // it is public because budget controller will be using it.
    return {
        getInput: function() {
        
            // object returning type, desc and value selected.
            return {
                //it will store value selected(+ or -). it will either 'inc' or 'exp'. it stores from option\
                // values.
                type: document.querySelector(DOMvars.inputType).value,
                description: document.querySelector(DOMvars.inputDesc).value,
                // parseFloat converts string to float(as our value was string)
                value: parseFloat(document.querySelector(DOMvars.inputValue).value)
            }
        },

        // function to add user input to the UI. It takes two parameters (input object and type which can
        // be either exp or inc).

        addListItem: function(obj, type) {
            var html, newHTML, element;

            if (type === 'inc') {
                element = DOMvars.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if (type === 'exp') {
                element = DOMvars.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // replace is used to replace id with object id(which is coming from user input). first
            // parameter is what has to replaced and second is with what we want it to be replaced.
            newHTML = html.replace('%id%', obj.id);

            newHTML = newHTML.replace('%description%', obj.description);

            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            // Insertadjacenthtml is used for setting our new html code in our already created html page.
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

        },

        deleteListItem: function(selectorId){
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },

        // function for clearing fields after user has entered expense or income.
        clearFields: function() {

            // select mulitple queries and gives a list of it.
            var fields = document.querySelectorAll(DOMvars.inputDesc + ', ' + DOMvars.inputValue);
        
            // converts our list to array
            var fieldsArray = Array.prototype.slice.call(fields);

            // for each value in array it will set it to null.
            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });

            // it will bring the cursor to description after user clicks on button.
            fieldsArray[0].focus();
        },

        displayBudget: function(obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMvars.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMvars.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMvars.expenseLabel).textContent = formatNumber(obj.totalExpense, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMvars.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMvars.percentageLabel).textContent = '---';
            }
            
        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMvars.expenseLabelPercentage);

            nodeListForEach(fields, function(current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
                

            });

        },

        displayDate: function() {
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth();

            months = ['Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

            document.querySelector(DOMvars.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {

            var fields = document.querySelectorAll(
                DOMvars.inputType + ',' +
                DOMvars.inputDesc + ',' +
                DOMvars.inputValue
            );

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMvars.inputBtn).classList.toggle('red');

        },

        DOMstrings: function(){
            return DOMvars;
        }

    };
})();


// Global controller which connects above two.
var budgetController = (function (budData, budUi) {
    
    var setEventListeners = function(){
        var dom = budUi.DOMstrings();
        // button selector event
        document.querySelector(dom.inputBtn).addEventListener('click', addItem);    

        // this is our global event i.e user can add bugdet on click of enter button also(a key press event)
        // And since it is global that's why no queryselector is used
        document.addEventListener('keypress', function(event){
        // in the above function we are passing an event parameter(name can be anything)
        // it will create an keyboard event. we using this because wehave to capture on pressing of
        // enter button only. it has a proto event and further this has a UI event and then event and last
        // object event. we will keycode property from keyboardevent.add
        
        // which property is for older browsers
            if (event.keyCode === 13 || event.which === 13){
                addItem();
            }

        });

        document.querySelector(dom.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(dom.inputType).addEventListener('change', budUi.changedType);

    };

    var updateBudget = function() {
        
        budData.calculateBudget();

        var budget = budData.getBudget();
        
        //console.log(budget);
        budgetUi.displayBudget(budget);

    };

    var updatePercentages = function() {

        budData.calculatePercentage();

        var percentages = budData.getPercentages();

        //console.log(percentages);

        budUi.displayPercentages(percentages);  

    };

    // function from getting UI inputs used here.
    var addItem = function(){
        var input,newItem;

        // getting inputs
        input = budUi.getInput();
        //console.log(input);

        if (input.description !== "" && !isNaN(input.value) && input.value > 0 ) {
            // storing input in data structure
            newItem = budData.additem(input.type, input.description, input.value);

            // displaying input in the UI
            budUi.addListItem(newItem, input.type);
            budUi.clearFields();

            updateBudget();

            updatePercentages();

        }
    };

    var ctrlDeleteItem = function(event) {
        // it will give us which element is hit.
        // event.target.parentNode will give us its parent node. and then using id proeperty to
        // get the id of the element.
        //console.log(event.target);
        var itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        //console.log(itemId);
        if (itemId) {

            var splitId = itemId.split('-');
            var type = splitId[0];
            var id = parseInt(splitId[1]);
        
        }

        budData.deleteItem(type, id);

        budUi.deleteListItem(itemId);

        updateBudget();

        updatePercentages();
    };

    return {
            // initialistaion function for event listeners
            init: function() {
            console.log("started");
            setEventListeners();

            budUi.displayDate();

            budUi.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: 0
            });
        }
    }
    
})(budgetData, budgetUi);

// initialistaion function calling
budgetController.init();