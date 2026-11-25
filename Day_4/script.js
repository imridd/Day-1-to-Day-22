// const fibonacci = n => {
//     let a=0, b=1, arr=[];
//     while (n--) {
//         arr.push(a);
//         [a, b] = [b, a+b];
//     }
//     return arr;
// };
// console.log(fibonacci(15));
// class Employee {
//     static count = 0;
//     #annualSalary;
//     constructor(id, name, department, annualSalary) {
//         this.id = id;
//         this.name = name;
//         this.department = department;
//         this.#annualSalary = annualSalary;
//         Employee.count++;
//     }
//     get annualSalary() {
//         return this.#annualSalary;
//     }
//     set annualSalary(amount) {
//         if (amount > 0) {
//             this.#annualSalary = amount;
//         } else {
//             console.log("Invalid Salary");
//         }
//     }
//     getMonthlySalary() {
//         return this.#annualSalary / 12;
//     }
//     getDaySalary(month) {
//         let days;
//         switch (month.toLowerCase()) {
//             case "january":
//             case "march":
//             case "may":
//             case "july":
//             case "august":
//             case "october":
//             case "december":
//                 days = 31;
//                 break;
//             case "april":
//             case "june":
//             case "september":
//             case "november":
//                 days = 30;
//                 break;
//             case "february":
//                 days = 28;
//                 break;
//             default:
//                 throw new Error("Invalid Month Name");
//         }
//         return (this.getMonthlySalary() / days);
//     }
//     getRole() {
//         return "Employee";
//     }
//     getProfile(month) {
//         return `
// ID : ${this.id}
// Name : ${this.name}
// Department : ${this.department}
// Role : ${this.getRole()}
// Annual Salary : ₹${this.annualSalary}
// Monthly Salary : ₹${this.getMonthlySalary()}
// Day Salary (${month}) : ₹${this.getDaySalary(month).toFixed(2)}
// `;
//     }
// }
// class Manager extends Employee {
//     constructor(id, name, department, annualSalary, teamSize) {
//         super(id, name, department, annualSalary);
//         this.teamSize = teamSize;
//     }
//     getRole() {
//         return "Manager";
//     }
//     getProfile(month) {
//         return super.getProfile(month) +
//             `Team Size : ${this.teamSize}\n`;
//     }
// }
// const emp1 = new Employee(
//     101,
//     "Rid",
//     "IT",
//     800000
// );
// const emp2 = new Employee(
//     102,
//     "Janet",
//     "HR",
//     840000
// );
// const emp3 = new Employee(
//     103,
//     "Guna",
//     "Finance",
//     740000
// );
// const mgr1 = new Manager(
//     201,
//     "Kavi",
//     "Development",
//     700000,
//     8
// );
// const mgr2 = new Manager(
//     202,
//     "Dharani",
//     "Testing",
//     840000,
//     5
// );
// console.log(emp1.getProfile("February"));
// console.log(emp2.getProfile("May"));
// console.log(emp3.getProfile("December"));
// console.log(mgr1.getProfile("April"));
// console.log(mgr2.getProfile("August"));
// console.log("Total Employees in the company as of now : ", Employee.count);

// const btnGenerate=document.querySelector("#btnGenerate");
// const numberList=document.querySelector("#numberList");
// const generateNumber=()=>{
//     const randomNumber =Math.floor(Math.random() * 101);
//     const li =document.createElement("li");
//     li.textContent = randomNumber;
//     li.classList.add("list-group-item");
//     numberList.appendChild(li);
//     [...numberList.children].forEach((item, index) => {
//             item.classList.remove("list-group-item-secondary");
//             if (index % 2 !== 0) {
//                 item.classList.add("list-group-item-secondary");
//             }
//         }
//     );
// };
// btnGenerate.addEventListener("click",generateNumber);
const dob = document.querySelector("#dob"),
      btnAge = document.querySelector("#btnAge"),
      result = document.querySelector("#result");
const calculateAge = () => {
    if (!dob.value)
        return result.textContent = "Please select Date of Birth";
    const birth = new Date(dob.value),
          now = new Date();
    let years = now.getFullYear() - birth.getFullYear(),
        months = now.getMonth() - birth.getMonth(),
        days = now.getDate() - birth.getDate(),
        hours = now.getHours() - birth.getHours(),
        minutes = now.getMinutes() - birth.getMinutes();
    if (minutes < 0) minutes += 60, hours--;
    if (hours < 0) hours += 24, days--;
    if (days < 0) days += 30, months--;
    if (months < 0) months += 12, years--;
    result.innerHTML = `
        Years : ${years}<br>
        Months : ${months}<br>
        Days : ${days}<br>
        Hours : ${hours}<br>
        Minutes : ${minutes}<br>
    `;
};
btnAge.addEventListener("click", calculateAge);