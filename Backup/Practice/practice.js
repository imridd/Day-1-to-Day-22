// const arr=[1,2,3,4,5];
// function sum(arr){
//     let s=0;
//     for(let i=0;i<arr.length;i++){
//         s+=arr[i];
//     }
//     return s;
// }
// console.log("Sum of the elements is ",sum(arr));
// const arr=[12,45,7,89,23];
// function largest(arr){
//     let l=arr[0];
//     for(let i=1;i<arr.length;i++){
//         if(arr[i]>l) l=arr[i];
//     }
//     return l;
// }
// console.log("Largest Element is ",largest(arr));
const arr=[12,45,7,89,23];
function smallest(arr){
    let l=arr[0];
    for(let i=1;i<arr.length;i++){
        if(l>arr[i]) l=arr[i];
    }
    return l;
}
console.log("Smallest Element is ",smallest(arr));