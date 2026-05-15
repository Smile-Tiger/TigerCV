import { ElNotification, ElMessageBox } from 'element-plus'
import nprogress from 'nprogress'

// 消息提示
export function toast(message,type = "success",dangerouslyUseHTMLString = false){
    ElNotification({
        message,
        type,
        dangerouslyUseHTMLString,
        duration:3000
    })
}

export function showModal(content = "提示内容",type = "warning",title = ""){
    return ElMessageBox.confirm(
        content,
        title,
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type,
        }
      )
}

// 显示全屏loading
export function showFullLoading(){
  nprogress.start()
}

// 隐藏全屏loading
export function hideFullLoading(){
  nprogress.done()
}

// 弹出输入框
export function showPrompt(tip,value = ""){
  return ElMessageBox.prompt(tip, '', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputValue:value
  })
}

// 转换路由参数
export function queryParams(query){
  let q = []
  for(let key in query){
    q.push(`${key}=${query[key]}`)
  }
  return q.join("&")
}

// 内容上移及下移
// 注意splice的使用splice(第一个参数，第二个参数，...后面的参数)
// 第一个参数是从数组哪一个位置开始，第二个参数是删除几个元素，后面的参数是要添加的元素
// 然后splice的返回值是删除的元素，数组返回
export function useArrayMoveUp(arr, index) {
  swapArray(arr, index, index - 1)
}

export function useArrayMoveDown(arr, index) {
  swapArray(arr, index, index + 1)
}

function swapArray(arr, index1, index2) {
  arr[index1] = arr.splice(index2, 1, arr[index1])[0]
  return arr
}

// !!! sku 的排列组合算法
export function cartesianProductOf() {
  return Array.prototype.reduce.call(arguments, function (a, b) {
      var ret = [];
      a.forEach(function (a) {
          b.forEach(function (b) {
              ret.push(a.concat([b]));
          });
      });
      return ret;
  }, [
      []
  ]);
}
