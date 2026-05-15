import { ref, nextTick, computed } from "vue"
import {
  createGoodsSkusCardAPI,
  updateGoodsSkusCardAPI,
  deleteGoodsSkusCardAPI,
  sortGoodsSkusCard,
  deleteGoodsSkusCardValue,
  createGoodsSkusCardValue,
  updateGoodsSkusCardValue,
  chooseAndSetGoodsSkusCard
} from "@/apis/goods.js"

import {
  useArrayMoveUp,
  useArrayMoveDown,
  cartesianProductOf
} from "@/composables/util.js"

export const goodsId = ref(0)

// 规格选项列表
export const sku_card_list = ref([])

// 规格选项表格的每一行数据，里面的数组每一个数据skus就是规格值的搭配
export const sku_list = ref([])

// 初始化规格选项列表
export function initSkuCardList(data) {
  sku_card_list.value = data.goodsSkusCard.map(item => {
    item.text = item.name
    item.goodsSkusCardValue.map(v => {
      v.text = v.value || '属性值'
      return v
    })
    return item
    // 通过新增一个text值，保证在修改失败的时候能够恢复原来修改前的值，避免丢失
  })

  sku_list.value = data.goodsSkus // 接收sku表格数据
}

export const btnLoading = ref(false)
// 添加规格选项
export const addSkuCardEvent = async () => {
  btnLoading.value = true
  const res = await createGoodsSkusCardAPI({
    goods_id: goodsId.value,
    name: "规格选项",
    order: 50, // 排序
    type: 0 // 类型
  })
  console.log(res)
  // 对返回的对象进行属性添加，保证与上面初始化选项列表时的属性完全一致
  sku_card_list.value.push({
    ...res,
    text: res.name,
    goodsSkusCardValue: []
  })
  console.log(sku_card_list.value)
  btnLoading.value = false
}

// 修改规格选项
export function handleUpdate(item) {
  updateGoodsSkusCardAPI(item.id, {
    "goods_id": item.goods_id,
    "name": item.text,
    "order": item.order,
    "type": 0
  })
    .then(res => {
      item.name = item.text
    })
    .catch(err => {
      item.text = item.name
    })
}

// 删除规格选项
export function handleDelete(item) {
  deleteGoodsSkusCardAPI(item.id)
    .then(() => {
      sku_card_list.value = sku_card_list.value.filter(i => i.id !== item.id)
    })
  getTableData()
}

// 排列规格选项
export const sortArray = async (action, index) => {
  // 这里注意点，利用JSON转换完成数组复制，避免直接赋值地址修改原数组
  // const 和 let 都可以修改引用数据类型的数据，所以这里const和let都可以
  const olist = JSON.parse(JSON.stringify(sku_card_list.value))
  const fun = action === 'up' ? useArrayMoveUp : useArrayMoveDown
  fun(olist, index) // 这里调用是修改需要作为请求的数组
  // map 遍历时传的参数，第一个是当前项，第二个是当前项的索引
  const sortData = olist.map((o, i) => {
    return {
      id: o.id,
      order: i + 1
    }
  })
  await sortGoodsSkusCard({ sortdata: sortData })
  fun(sku_card_list.value, index)
  getTableData()
}

// 这里的逻辑是，点击更多，选择规格选项的规格值，会自动赋值整个规格选项表格
export const handleChooseSetGoodsSkusCard = async (id, data) => {
  const item = sku_card_list.value.find(o => o.id === id)
  const res = await chooseAndSetGoodsSkusCard(id, data)
  item.name = res.goods_skus_card.name
  item.goodsSkusCardValue = res.goods_skus_card_value.map(o => {
    o.text = o.value || '属性值'
    return o
  })
  getTableData()
}

// 初始化规格SkuCardItem的值
export function initSkuCardItem(id, InputRef) {
  const item = sku_card_list.value.find(i => i.id === id)

  const inputValue = ref('')
  const inputVisible = ref(false)

  const handleClose = async (tag) => {
    await deleteGoodsSkusCardValue(tag.id)
    item.goodsSkusCardValue = item.goodsSkusCardValue.filter(i => i.id !== tag.id)
    getTableData()
  }

  const showInput = () => {
    inputVisible.value = true
    nextTick(() => {
      InputRef.value.input.focus()
    })
    // nextTick就是把当前内容放入微任务队列中去，等当前任务执行完成后再执行
  }

  const handleChange = (value, tag) => {
    updateGoodsSkusCardValue(tag.id, {
      "goods_skus_card_id": id,
      "name": item.name,
      "order": tag.order,
      "value": value
    })
      .then(() => {
        tag.value = value
        getTableData()
      })
      .catch(() => {
        tag.text = tag.value
      })
  }

  const handleInputConfirm = () => {
    if (!inputValue.value) {
      inputVisible.value = false
      return
    }

    createGoodsSkusCardValue({
      goods_skus_card_id: id,
      name: item.name,
      order: 50,
      value: inputValue.value
    })
      .then(res => {
        item.goodsSkusCardValue.push({
          ...res,
          text: inputValue.value
        })
        getTableData()
      })
      .finally(() => {
        inputVisible.value = false
        inputValue.value = ''
      })

  }

  return {
    item,
    handleClose,
    showInput,
    handleInputConfirm,
    InputRef,
    inputValue,
    inputVisible,
    handleChange,
  }
}

// 初始化表格，表格联动
export const initSkuTable = () => {
  // 规格选项，要使用它的规格值长度筛选掉空的规格选项
  const skuLabels = computed(() => sku_card_list.value.filter(o => o.goodsSkusCardValue.length > 0))

  // 获取表头
  const tableThs = computed(() => {
    let length = skuLabels.value.length
    return [{
      name: "商品规格",
      colspan: length,
      width: "",
      rowspan: length > 0 ? 1 : 2
    }, {
      name: "销售价",
      width: "100",
      rowspan: 2 // 合并两行
    }, {
      name: "市场价",
      width: "100",
      rowspan: 2
    }, {
      name: "成本价",
      width: "100",
      rowspan: 2
    }, {
      name: "库存",
      width: "100",
      rowspan: 2
    }, {
      name: "体积",
      width: "100",
      rowspan: 2
    }, {
      name: "重量",
      width: "100",
      rowspan: 2
    }, {
      name: "编码",
      width: "100",
      rowspan: 2
    }]
  })

  return {
    skuLabels,
    tableThs,
    sku_list
  }
}

// 获取规格表格的数据，在每一个规格选项的操作中添加，保证数据实时更新
const getTableData = () => {
  if (sku_card_list.value.length === 0) return []

  const list = [] // 规格选项的规格值数组
  sku_card_list.value.forEach(o => {
    if (o.goodsSkusCardValue.length > 0) {
      list.push(o.goodsSkusCardValue)
    }
  })

  if (list.length === 0) return []

  const arr = cartesianProductOf(...list) // “规格值”的排列组合后的结果，是一个由多个规格值数组组成的数组

  console.log(arr)

  // 取出对象中原本的goodsSkus
  let beforeSkuList = JSON.parse(JSON.stringify(sku_list.value)).map(o => {
    if(!Array.isArray(o.skus)){
      // 将对象转数组，将所有键值（0,1）取出来组成数组后遍历键对应的值，将键替换成值
      o.skus = Object.keys(o.skus).map(k => o.skus[k])
    }
    // 增加多一个skusId组合属性，这里的sort用了自定义排序(a, b) => a - b表示升序，反之降序，取出id值进行逗号拼接
    o.skusId = o.skus.sort((a, b) => a.id - b.id).map(o => o.id).join(',')
    return o
  })

  console.log(beforeSkuList)

  // 操作后的规格值表格进行重排列后，重新赋值给sku_list.value，所以要先清空
  sku_list.value = []
  sku_list.value = arr.map(skus => {
    const o = getBeforeSkuItem(JSON.parse(JSON.stringify(skus)), beforeSkuList)
    // 根据下面可以访问o的code之类的内容，返回的是一个完整的“表格规格值”对象
    return {
      code: o?.code || "",
      cprice: o?.cprice || "0.00",
      goods_id: goodsId.value,
      image: o?.image || "",
      oprice: o?.oprice || "0.00",
      pprice: o?.pprice || "0.00",
      skus,
      stock: o?.stock || 0,
      volume: o?.volume || 0,
      weight: o?.weight || 0,
    }
  })
}

// 前后表格的规格值比较，保证在增加和减少规格值后，原先表格的数据能够保留下来
const getBeforeSkuItem = (skus, beforeSkuList) => {
  const skusId = skus.sort((a, b) => a.id - b.id).map(o => o.id).join(',')
  return beforeSkuList.find(o => {
    if(skus.length > o.skus.length){
      return skusId.indexOf(o.skusId) != -1 // 这个是匹配规则，如果匹配成功，返回与它匹配的历史规格值对象
    }
    return o.skusId.indexOf(skusId) != -1
  })
}

// 情况A：当前规格更多（新增了规格）
// ┌─────────────────────────────────────┐
// │  当前: "4841,4853" (2个规格)         │
// │  历史: "4841"      (1个规格)         │
// │                                     │
// │  判断: 当前是否包含历史？             │
// │  "4841,4853" 包含 "4841" → 匹配成功  │
// └─────────────────────────────────────┘

// 情况B：当前规格更少（删除了规格）
// ┌─────────────────────────────────────┐
// │  当前: "4841"      (1个规格)         │
// │  历史: "4841,4853" (2个规格)         │
// │                                     │
// │  判断: 历史是否包含当前？             │
// │  "4841,4853" 包含 "4841" → 匹配成功  │
// └─────────────────────────────────────┘
