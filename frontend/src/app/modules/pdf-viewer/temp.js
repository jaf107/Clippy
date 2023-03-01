// console.log(remainingWords);
// let refDatas = AllRefs.filter((ref) => ref.str.includes('figure'));
// for (let k = 1; k < remainingWords.length; k++) {
//   if (remainingWords[k].length > 0) {
//     let wordWithNo = remainingWords[k];
//     if (
//       wordWithNo.charCodeAt(0) >= '0'.charCodeAt(0) &&
//       wordWithNo.charCodeAt(0) <= '9'.charCodeAt(0)
//     ) {
//       let data = {};
//       let key = remainingWords[k][0];
//       console.log('id:', key, 'index:', k);
//       for (let r = 0; r < refDatas.length; r++) {
//         if (refDatas[r].str.includes(key)) {
//           data = refDatas[r];
//           break;
//         }
//       }
//       console.log({ ...data, requireManualAnnotaion: true });

//       break;
//     }
//   }
// }
// return;
