let h=1.72;
let w=70;
let bmi=w/(h*h);
console.log("BMI ",bmi);
switch(true){
    case (bmi<18.5):
        console.log("Weight Status: Under Weight");
        break;
    case(bmi>=18.5&&bmi<24.9):
    console.log("Weight Status: Healthy Weight");
    break;
    case(bmi>=25&&bmi<29.9):
    console.log("Weight Status:Over Weight");
    break;
    default:
        console.log("Obesity");
        break;
}