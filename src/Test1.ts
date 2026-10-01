const utils = require('./Utils');
const unit_test = async ()=>{
    if(utils.add(2,3)===5){
    }
        else{
            console.log("test case 1: utils.add(2,3)===5");
            process.exit(1);
        }
    if(utils.add(3,3)===6){
    }
        else{
            console.log("test case 2: utils.add(3,3)===6");
            process.exit(1);
        }
    if(utils.add(3,-3)=== -6){
    }
        else{
            console.log("test case 2: utils.add(3,-3)=== -6");
            process.exit(1);
        }
}
unit_test();
