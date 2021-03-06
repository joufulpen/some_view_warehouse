function passSelection({
  to,
  data
}) {
  console.log('parent--passSelection', to);
  if(data.length == 0 || data.length>1) {
    return Vue.prototype.$notify.warning({
        title: '选取失败',
        message: '请选择符合条件的单一条数据',
        duration: 2000,
      })
  }
  document.getElementById(to).contentWindow.postMessage({
    method: 'alertData',
    args: data
  }, '*')
  vm.dialogs[1].visible = !vm.dialogs[1].visible
}

var resourceName = 'StoreOut'
var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
window.vm = new Vue({
  el: '#root',
  data: {
    // urlGetHdrData: apiDict[apiName] + 'storeOut/hdr/queryList',
    // urlGetDltData: apiDict[apiName] + 'storeOut/dlt/queryList',
    // urlDel: apiObject.warehouseURL + '/storeOut/hdr/delete',
    // urlSubmit: apiObject.warehouseURL + '/storeOut/hdr/submitConfirm',

    axiosSetting: {
      baseURL: apiDict[apiName],
    },
    uniqueDeployKey: {
      api: apiDict[apiName] + resourceName
    },
    isMethods: {
      isGetCondition: false,
      isTableRowClick: false,
      isPaginationSizeChange: false,
      isPaginationCurrentChange: false
    },
    hdrTableData: {},
    dtlTableData: [],
    // selected: [],
    // iframe弹出框
    dialogs: [{
      top: '5vh',
      name: 'dialog1',
      visible: false,
      collapse: false,
      width: '90%',
      // iframeHeight: '500px',
      title: '',
      src: '',
    },{
      top: '5vh',
      name: 'dialog2',
      visible: false,
      collapse: false,
      width: '90%',
      // iframeHeight: '500px',
      title: '',
      src: '',
      showSaveButton: true
    } ],
    buttons: [],
    // 查询条件
    // hdrQuery: [],
    dltQuery: [],
    queryCondition: {},
    employeeList: [],
  },
  mounted() {
    this.$refs.masterView.dtlTableData[0].columns.map(p=>{
      if(p.label == '出库数量') p.formatter = numberToFixedFormatter
    })
    for (let i in window.coolLocals) {
      for (let p in JSON.parse(window.coolLocals[i])) {
        this[p] = JSON.parse(window.coolLocals[i])[p]
      }
    }

    this.$refs.masterView.hdrTableData.columns.map(p => {
      if (p.type == 'selection') {
        p.selectable = function(arg) {
          if (arg.status == '3') {
            return false
          } else return true
        }
      }
      if (p.label == '出仓单状态') {
        p.formatter = function(arg){
          if(arg.status == '2') return '已完成'
        }
      }
      if (p.label == '出仓日期') {
        p.formatter = dateFormatter
      }
    })

    this.$el.style.visibility = 'visible'
    this.getWarehouseData()
    this.getEmployee()
    // this.getHdrData()
  },
  methods: {
    getWarehouseData() {
      axiosDict[apiName].get(`Warehouse/GetList?condition=[]`)
      .then(res => {
        console.log('仓库查询',res);
        let options = res.map(p => ({
          value: p.id,
          label: p.name
        }))
        this.$refs.masterView.queryCondition.whid.options = options
      })
    },
    // 出仓人选项
    getEmployee() {
      axiosDict['basic'].get(`Employee/GetList?condition=[]`)
        .then(res=>{
          this.employeeList = res.map(p => ({
            value: p.id,
            label: p.name
          }))
        })
    },
    remoteMethod(query) {
      if (query !== '') {
        this.$refs.masterView.queryCondition.operator.loading = true
        setTimeout(() => {
          this.$refs.masterView.queryCondition.operator.loading = false
          this.$refs.masterView.queryCondition.operator.options = this.employeeList.filter(item => {
            return item.label.toLowerCase()
              .indexOf(query.toLowerCase()) > -1;
          })
        }, 500);
      } else {
        this.$refs.masterView.queryCondition.operator.options = []
      }
    },
    // searchData() {
    //   this.$refs.masterView.hdrTableData.currentPage = 1
    //   this.getHdrData()
    // },
    // 主表查询
    // getHdrData() {
    //   this.$refs.masterView.dtlTableData[0].data = []
    //   this.$refs.masterView.hdrTableData.data = []
    //   newAxios.post(this.urlGetHdrData, {
    //     condition: {
    //       current: this.$refs.masterView.hdrTableData.currentPage,
    //       offset: this.$refs.masterView.hdrTableData.pageSize,
    //       hdr: this.hdrQuery,
    //     }
    //   }).then(res => {
    //     console.log('主表查询', res);
    //     let data = []
    //     data = formatIndex(res.data.records, this.$refs.masterView.hdrTableData.currentPage, this.$refs.masterView.hdrTableData.pageSize)
    //     this.$refs.masterView.hdrTableData.total = res.data.total
    //     this.$refs.masterView.hdrTableData.data = data
    //   })
    // },
    // 从表查询
    // getDltData() {
    //   newAxios.post(this.urlGetDltData, {
    //     condition: {
    //       dlt: this.dltQuery
    //     }
    //   }).then(res => {
    //     console.log('获取从表', res);
    //     this.$refs.masterView.dtlTableData[0].data = res.data.records
    //   })
    // },
    //获取查询参数
    getCondition(arg) {
      console.log('getCondition', arg);
      // let query = []
      // query = arg.map(p => ({
      //   key: p.FieldName,
      //   value: p.DataType == 'date' ? p.Value.map(item => item.value) : p.Value[0].value,
      //   type: 'like'
      // }))
      // console.log('query', query);
      // this.hdrQuery = query
      // this.$refs.masterView.hdrTableData.currentPage = 1
    },
    newData() {
      this.dialogs[0].title = '新建出仓单'
      // this.$refs.masterView.clearSelectionOuter()
      // this.$refs.masterView.clearCurrentRow()
      this.dialogs[0].src = `../outStore-maintenance/index.html#${token}`
      getDialog(this.dialogs,'dialog1').visible = true
    },
    printData() {
      axiosDict[apiName].get(`StoreOut/GetHdrPageList?page=1&size=2147483647&condition=${JSON.stringify(this.$refs.masterView.condition)}`)
        .then(res => {
          console.log('主表查询', res);
          coolSti.view({
            token: token, //实际使用时请从window取值
            url: apiDict['system'] + 'coolSti',
            // report: 'SimpleList',
            // template: 'Report',
            report: '出仓单管理',
            template: '默认',
            data: res.rows,
            variables: {
              Today: new Date()
            },
            pageTitle: '出仓单打印',
            isDirectEdit: false,
            onPrintReportName: 'onPrintReport',
            // id: this.currentSelection[0].formno,
          })
        })
    },
    // 表格点击事件
    handleRowClick(arg) {
      // this.dltQuery = []
      // this.dltQuery.push({
      //   key: 'formNo',
      //   value: arg.formno
      // })
      // this.getDltData()
    },
    // 表格多选操作
    // selection(arg) {
    //   this.selected = arg
    // },
    paginationSizeChange(arg) {
      // this.$refs.masterView.hdrTableData.currentPage = 1
      // this.$refs.masterView.hdrTableData.pageSize = arg
      // this.getHdrData()
    },
    paginationCurrentChange(arg) {
      // this.$refs.masterView.hdrTableData.currentPage = arg
      // this.getHdrData()
    },
    dialogSaveEvent() {
      console.log('Dialog1--dialogSaveEvent');
      let to = 'dialog1'
      let secondDialog = document.getElementById('dialog2')
      secondDialog.contentWindow.postMessage({
        method: 'postSelection',
        args: {
          to
        }
      }, '*')
    },
    dialogBackEvent() {
      console.log('Dialog1--dialogBackEvent');
      getDialog(this.dialogs,'dialog2').visible = false
    },

    //生成excel
    outputExcel(res) {
      let nameList = ['formno', 'operationDate', 'storeOutKind', 'code', 'name', 'specifications', 'qty', 'stockKeepingUnit','operatorName', 'storeName', 'description']
      axios
        .get('template.xlsx', { responseType: 'blob' })
        .then(rTemplate => window.XlsxPopulate.fromDataAsync(rTemplate.data))
        .then(workbook => {
          let sheet = workbook.sheet('Sheet')
          let packages = Array.from(res)
          let row = 1
          packages.forEach(pack => sheet.cell(++row, 1).value([nameList.map(name => pack[name])]))
          return workbook.outputAsync()
        })
        .then(blob => window.saveAs(blob,  '出仓报表.xlsx'))
    },
    output(res) {
      axiosDict[apiName].get(`StoreOut/GetDtls?condition=${JSON.stringify(this.$refs.masterView.condition)}&orderBy=operationDate desc`)
        .then(res => {
          console.log(res)
          res.forEach(p=> {
            p.createDate = dayjs(p.createDate).format('YYYY-MM-DD')
            p.operationDate = dayjs(p.operationDate).format('YYYY-MM-DD')
            p.updateDate = dayjs(p.updateDate).format('YYYY-MM-DD')
          })
          this.outputExcel(res)
        })
    },
  }
})
