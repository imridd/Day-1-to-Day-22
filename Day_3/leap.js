let yr=2004;
let mon=2;
switch(mon){
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
        console.log("Days = 31");
    break;
    case 4:
    case 6:
    case 9:
    case 11:
        console.log("Days = 30");
        break;
    case 2:
        let leap=(yr%4===0&&yr%100!==0)||(yr%400===0);
        if(leap===true){
            console.log("Days=29");
        }
        else{
            console.log("Days=28");
        }
        break;
        default:
            console.log("Invalid Month");
}
