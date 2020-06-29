var apiName = 'warehouse'
window.vm = new Vue({
  el: '#root',
  data: {
    urlGetAllData: apiDict[apiName] + 'adjustOut/hdr/queryList',
    urlGetDltData: apiDict[apiName] + 'adjustOut/dlt/queryList',
    urlDel: apiDict[apiName] + 'adjustOut/hdr/delete',
    urlSubmit: apiDict[apiName] + 'storeOut/hdr/submitConfirm',
    // urlGetEditData: config + '/storeIn/hdr/queryDetail',
    urlGetWarehouseData: apiDict[apiName] + 'store/hdr/queryList', //获取仓库选项
    urlGetPositionData: apiDict[apiName] + 'store/dlt/queryList',
    urlSaveOnSale: apiDict[apiName] + 'putShelves/hdr/saveHdrForAdjustIn',

    // cool views
    showQuery: true,
    hdrTableData: {
      data: [],
      total: 0,
      showPage: true,
      pageSize: 10,
      currentPage: 1,
      layout: 'total, sizes, prev, pager, next, jumper',
      cellStyle: {
        height: '30px',
        padding: '5px 0'
      },
      columns: [{
          type: 'selection',
          selectable: function(row) {
            if (row.status == 3) {
              return false
            } else return true
          }
        }, {
          prop: 'index',
          label: '序号',
          fixed: 'fixed',
          width: '50px'
        },
        {
          prop: "formNo",
          label: "调拨单号",
          width: '160',
          fixed: 'fixed'
        }, {
          prop: "operationDate",
          label: "调拨日期",
          formatter(arg) {
            if (arg.operationDate) {
              return dayjs(arg.operationDate).format("YYYY-MM-DD")
            }
          }
        }, {
          prop: "outStoreName",
          label: "转出仓库"
        },
        // {
        //   prop: "storeName",
        //   label: "转入仓库"
        // },
        {
          prop: "operatorName",
          label: "经办人"
        }, {
          prop: "operatorName",
          label: "操作人"
        }, {
          prop: "operationDate",
          label: "操作时间",
          formatter(arg) {
            if (arg.operationDate) {
              return dayjs(arg.operationDate).format("YYYY-MM-DD")
            }
          }
        }, {
          prop: "status",
          label: "审核状态",
          formatter: function(arg) {
            if (arg.status == 1) {
              return arg.status.value = '新建'
            }
            if (arg.status == 2) {
              return arg.status.value = '待确认'
            }
            if (arg.status == 3) {
              return arg.status.value = '已确认'
            }
          }
        }, {
          prop: "confirmName",
          label: "审核人"
        }, {
          prop: "confirmTime",
          label: "审核时间"
        }, {
          prop: "description",
          label: "备注"
        }
      ],
    },
    dltTableData: [{
      label: '调拨明细',
      data: [],
      cellStyle: {
        height: '30px',
        padding: '5px 0'
      },
      columns: [{
          prop: 'index',
          label: '序号',
          fixed: 'fixed',
          type: 'index',
          width: '50px'
        },
        {
          prop:'code',
          label:'编码'
        },
        {
          prop:'',
          label:'转出仓库'
        },
        {
          prop:'',
          label:'转入仓库'
        },
        {
          prop:'qty',
          label:'数量'
        }
        // {
        //   prop: "code",
        //   label: "物料编码",
        //   width: '160',
        //   fixed: 'fixed'
        // }, {
        //   prop: "name",
        //   label: "物料名称"
        // }, {
        //   prop: "productName",
        //   label: "规格"
        // }, {
        //   prop: "qty",
        //   label: "数量"
        // }, {
        //   prop: "",
        //   label: "主材质"
        // }, {
        //   prop: "",
        //   label: "主花色"
        // }, {
        //   prop: "storeId",
        //   label: "转出仓位"
        // }, {
        //   prop: "storeId",
        //   label: "转入仓位"
        // }, {
        //   prop: "",
        //   label: "库存单位"
        // }, {
        //   prop: "",
        //   label: "批次"
        // }, {
        //   prop: "description",
        //   label: "备注"
        // }
      ],
    }],


    // dialogVisible: false,
    fulldata: undefined,
    waiting: false,
    // productData1: [],
    // dltTableData2:[],
    currentRow: undefined,
    currentformNo: undefined,
    formNoArray: [],
    ids: [],
    selected: [],
    cellRow: {
      height: '30px',
      padding: '5px 0'
    },
    // 上架
    showEdit: false,
    onSaleWaiting: false,
    onSaleCodes: '',
    positionData: [],
    storeNameData: [],
    position: '',
    storeName: '',
    inputNum: 0,
    maxNum: 0,
    addOnSaleDisabled: true,
    fullOnSaleData: [],
    onSaleData: [],
    onSaleSelected: [],
    editOnSaleColumns: [{
      type: 'selection',
      width: '35px'
    }, {
      prop: "code",
      label: "产品编码"
    }, {
      prop: "storeId",
      label: "仓库名称"
    }, {
      prop: "storeDltCode",
      label: "仓位"
    }, {
      prop: "leave",
      label: "上架数量"
    }],
    // 弹出框
    dialogs: [{
        top: '5vh',
        name: 'dialog1',
        visible: false,
        collapse: false,
        width: '90%',
        // iframeHeight: '500px',
        title: '新增/编辑调出单',
        src: '../allocation-maintenance/index.html',
      },
      {
        top: '5vh',
        name: 'dialog2',
        visible: false,
        collapse: false,
        width: '90%',
        // iframeHeight: '500px',
        title: '',
        src: '',
      },
    ],
    buttons: [{
        text: '查询',
        size: 'mini',
        icon: 'el-icon-search',
        disabled: false
      },
      // {
      //   text: '提交',
      //   size: 'mini',
      //   icon: 'el-icon-upload2',
      //   disabled: true
      // },
      {
        text: '新建',
        size: 'mini',
        icon: 'el-icon-plus',
        disabled: false
      },
      {
        text: '编辑',
        size: 'mini',
        icon: 'el-icon-edit',
        disabled: true
      },
      // {
      //   text: '手工上架',
      //   size: 'mini',
      //   icon: 'el-icon-edit-outline',
      //   disabled: true,
      // },
      {
        text: '审核',
        size: 'mini',
        icon: 'el-icon-check',
        disabled: true
      },
      {
        text: '删除',
        size: 'mini',
        icon: 'el-icon-delete',
        disabled: true
      },
      {
        text: '导出',
        size: 'mini',
        icon: 'el-icon-download',
        disabled: true
      }
    ],
    // 分页
    total: 0,
    pagination: {
      page: 1,
      pageSize: 10
    },
    condition: {
      current: 1,
      offset: 10,
      hdr: []
    },
    // 查询响应内容
    hdrQuery: [],
    dltQuery: [],
    layout: 'total, sizes, prev, pager, next, jumper',
    //获取从表请求接口所需数据
    dltData: {
      dlt: []
    },
    // 查询条件
    originCondition: [

      {
        value: '',
        name: '调拨单号',
        fieldName: 'formNo',
        form: 'input'
      },
      {
        value: '',
        name: '转出仓库',
        fieldName: 'outStoreId',
        form: 'select',
        options: []
      }
      // ,
      //  {
      //   value: '',
      //   name: '转入仓库',
      //   fieldName: 'inStoreId',
      //   form: 'select',
      //   options: []
      // }
    ],
  },
  mounted() {
    this.$el.style.visibility = 'visible'
    this.getAllData()
    this.getWarehouseData()
  },
  watch: {
    inputNum: function(val) {
      // this.inputNum = val
      this.addOnSaleDisabled = val === 0
    },
  },
  methods: {
    closedialog() {
      this.$refs.multipleTable.hdrClearSelectionOuter()
      this.dltQuery.forEach(p => {
        if (p.key == 'formNo') {
          p.value = ''
        }
      })
      this.clearEditOnSale()
      this.onSaleData = []
    },
    //autocomplete控件事件
    // 获取下拉数据列表
    querySearch(queryString, cb) {
      this.position = ''
      this.maxNum = 0
      this.inputNum = 0
      var _this = this
      let arr = JSON.parse(JSON.stringify(this.fullOnSaleData)).map(p => ({
        value: p.code,
        name: p.name
      }))
      var results = queryString ?
        arr.filter(this.createFilter(queryString)) :
        arr
      cb(results)
    },
    createFilter(queryString) {
      return p => {
        return (
          p.value.toLowerCase().indexOf(queryString.toLowerCase()) !== -1
        )
      }
    },
    handleSelect(item) {
      this.onSaleCodes = item.value

      let sumLeave = 0
      this.onSaleData.forEach(p => {
        if (p.code == item.value) {
          sumLeave += p.leave
        }
      })

      this.fullOnSaleData.forEach(p => {
        if (p.code == item.value && (p.leave - sumLeave) >= 0) {

          this.maxNum = p.leave - sumLeave
          // this.onSaleData.forEach(i => {
          //   if(i.code)
          // })

        }
      })
    },
    // 添加数据进表格
    addOnSale() {
      // this.onSaleData.forEach(i => {
      // if (i.code == this.onSaleCodes && i.storeDltCode == this.position) {
      //   return this.$message.warning('同一产品请不要重复添加进相同仓位中')
      // }
      // })
      // console.log('123');
      let arr = JSON.parse(JSON.stringify(this.fullOnSaleData)).filter(p => p.code == this.onSaleCodes)
      arr[0].storeDltCode = this.position
      arr[0].qty = arr[0].leave = this.inputNum
      arr[0].storeId = this.storeName
      console.log(arr, this.storeName, this.inputNum);
      this.onSaleData.push(arr[0])
      this.clearEditOnSale()
    },
    deleteOnSale() {
      this.onSaleSelected.forEach(p => {
        this.onSaleData.splice(this.onSaleData.indexOf(p), 1)
      })
      this.clearEditOnSale()
    },
    defaultOnSale() {
      this.onSaleData = JSON.parse(JSON.stringify(this.fullOnSaleData))
      this.onSaleData.forEach(p => {
        p.storeDltCode = ''
      })
    },
    onSaleSelectionChange(arg) {
      this.onSaleSelected = arg
    },
    saveOnSale() {
      this.onSaleData.forEach(p => {
        p.storeDltId = p.id
      })
      let params = {
        save: {
          hdr: {
            formNo: this.selected[0].formNo,
          },
          dlt: this.onSaleData
        }
      }
      let fn = res => {
        this.showEdit = false
        this.getAllData()
      }
      coolAxios(this.urlSaveOnSale, params, this, fn)
    },
    clearEditOnSale() {
      this.position = ''
      this.onSaleCodes = ''
      this.storeName = ''
      this.inputNum = 0
      this.maxNum = 0
    },
    // 获取仓位数据
    getPositionData() {
      // this.waiting = true
      this.positionData = []
      if (this.storeName == '' || this.storeName == null) {
        this.$message({
          type: 'warning',
          message: '请先选择仓库名称！',
          duration: 1000
        });
      } else {
        let params = {
          condition: {
            dlt: [{
              key: 'storeId',
              value: this.storeName
            }]
          }
        }
        let fn = res => {
          this.positionData = res.data.records.map(p => {
            var obj = {}
            obj.value = p.shortCode
            return obj
          })
        }
        coolAxios(this.urlGetPositionData, params, this, fn)
      }

    },
    // 上架相关
    // getFullOnSaleData() {
    //   let params = {
    //     condition: {
    //       dlt: [{
    //         key: 'formNo',
    //         value: this.selected[0].formNo
    //       }]
    //     }
    //   }
    //   coolAxios(this.urlGetDltData, params, this, {
    //     takeData: this.fullOnSaleData
    //   })
    // },
    //获取传出的查询参数
    getCondition: function(arg) {
      arg.forEach(p => {
        p.type = 'like'
      })
      this.hdrQuery = arg
      console.log(this.hdrQuery)
    },
    // 获取仓库选项
    getWarehouseData() {
      let fn = res => {
        this.areaName = res.data.records
        this.storeNameData = this.originCondition[1].options = res.data.records.map(p => {
          var obj = {}
          obj.value = p.id
          obj.label = p.name
          return obj
        })
      }
      coolAxios(this.urlGetWarehouseData, {
        condition: {
          hdr: []
        }
      }, this, fn)
    },
    // 查询已添加的数据
    getAllData() {
      this.dltTableData[0].data.splice(0, this.dltTableData[0].data.length)
      coolAxios(this.urlGetAllData, {
        condition: {
          current: this.pagination.page,
          offset: this.pagination.pageSize,
          hdr: this.hdrQuery
        }
      }, this, {
        takeData: this.hdrTableData.data,
        total: this.hdrTableData.total
      })
    },
    // 删除进仓单
    delTab() {
      delData(this.urlDel, {
        delete: {
          hdr: this.ids
        }
      }, this, this.getAllData)
    },
    // 提交数据
    submitData() {
      coolAxios(this.urlSubmit, {
        formNo: this.formNoArray
      }, this, {
        msg: true,
        fn: this.getAllData
      })
    },
    // 提取获取从表
    getDltData() {
      let obj = {
        takeData: this.dltTableData[0].data,
        fn: () => {
          this.dltQuery.splice(0, this.dltQuery.length)
        }
      }
      coolAxios(this.urlGetDltData, {
        condition: this.dltData
      }, this, obj)
    },
    // 表格点击事件
    handleRowClick(arg) {
      this.dltData.dlt = []
      if (arg !== undefined) {
        this.currentRow = arg
        this.currentformNo = arg.formNo
        this.dltData.dlt.push({
          'key': 'formNo',
          'value': this.currentformNo
        })
        this.getDltData()
      }
    },
    // 表格多选操作
    selection(arg) {
      // this.buttons[1].disabled = arg.length === 0
      // console.log(arg[0])
      this.buttons[2].disabled = arg.length !== 1
      this.buttons[3].disabled = arg.length !== 1
      this.buttons[4].disabled = arg.length === 0
      this.ids = []
      if (arg.length != 0) {
        this.formNoArray = []
        this.selected = arg
        this.selected.forEach(p => {
          this.ids.push(p.id)
          this.formNoArray.push(p.formNo)
          this.currentId = p.id
          if (p.status == 2) {
            this.buttons[2].disabled = true
            this.buttons[4].disabled = true
          }
        })
        console.log(this.formNoArray)
      } else this.selected = []

    },
    paginationSizeChange(arg) {

      this.pagination.page = 1
      this.pagination.pageSize = arg
      console.log(this.pagination.pageSize)
      this.getAllData()
    },
    paginationCurrentChange(arg) {

      this.pagination.page = arg
      console.log(this.pagination.page)
      this.getAllData()
    },
    // 按钮点击事件
    buttonsevent: function(args) {
      switch (args.currentTarget.textContent) {
        case '查询':
          {
            this.getAllData()
            break
          }
        case '提交':
          {
            this.submitData()
            // console.log('提交操作');
            break
          }
        case '新建':
          {
            this.$refs.multipleTable.hdrClearSelectionOuter()
            this.$refs.multipleTable.hdrClearCurrentRow()
            // this.dialogVisible = true
            // console.log();
            this.dialogs[0].src = `../allocation-maintenance/index.html#${token}`
            setTimeout(() => {
              getDialog(this.dialogs,'dialog1').visible = true
            }, 100)
            console.log("新建操作");
            break
          }
        case '编辑':
          {
            this.dialogs[0].src = `../allocation-maintenance/index.html#${token}#${this.currentId}`
            setTimeout(() => {
              getDialog(this.dialogs,'dialog1').visible = true
            }, 100)
            // console.log("编辑操作")
            break
          }
        // case '手工上架':
        //   {
        //     // this.getPositionData()
        //     this.showEdit = true
        //     this.getFullOnSaleData()
        //     break
        //   }
        case '审核':{
          console.log('审核');
          break
        }
        case '删除':
          {
            this.delTab()
            break
          }
        case '导出':
          {
            console.log('导出操作');
            break
          }
        default:
          console.log("！未知错误！")
          break
      }
    },
  }
})
