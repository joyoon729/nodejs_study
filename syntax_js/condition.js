// nodejs argv 의 1번째 인자 = nodejs runtime 경로
// 2번째 인자 = 실행파일 경로
// 3번째 이후 인자 = 입력받은 인자들..
var args = process.argv;
console.log(args[2]);
console.log('A');
console.log('B');
if(args[2] === '1'){
  console.log('C1');
} else {
  console.log('C2');
}
console.log('D');
