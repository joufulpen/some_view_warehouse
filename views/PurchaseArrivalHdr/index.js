function postSelection(args, source) {
  console.log(5, 'postSelection', args)
  let data = vm.currentSelected
  source.postMessage({
    method: 'passSelection',
    args: {
      data: data,
      to: args.to
    }
  }, '*')
}

function passSelection({
  to,
  data
}) {
  console.log('dataaaaaaaaaaaaaaaaa', data);
  console.log('parent--passSelection', to);
  if (data.length == 0 || data.length > 1) {
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

var resourceName = 'PurchaseArrival' //资源名称 模板生成
var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
window.vm = new Vue({
  el: '#root',
  data: {
    urlGetEmployee: 'Employee/GetList',
    // uniqueDeployKeyURL为前端已定义的变量 面的EmployeeInfo为后端模板生成的文件变量名 后面的为固定格式 需模板生成
    uniqueDeployKey: {
      api: apiDict[apiName] + resourceName
    },
    // axiosSetting 固定格式 需模板生成生成
    axiosSetting: {
      baseURL: apiDict[apiName],
    },
    // cool-single-dialog组件的json文件名以及它的api名称 uniqueKeyURL为前端已定义的变量 后面的EmployeeInfo为后端模板生成的文件变量名
    isMethods: {
      isGetCondition: false,
      isTableSelectionChange: false,
      isTableRowClick: true,
      // isPaginationSizeChange: true,
      // isPaginationCurrentChange: true
    },
    showModeList: true,
    // 弹出框 固定格式 里面的值可按以下定义 需模板生成
    dialogs: [{
      top: '3vh',
      name: 'dialog1',
      visible: false,
      collapse: false,
      width: '90%',
      title: '',
      src: '',
      showSaveButton: true,
      saveBtnDisabled: true
    }, {
      top: '3vh',
      name: 'dialog2',
      visible: false,
      collapse: false,
      width: '90%',
      title: '',
      src: '',
      showSaveButton: true
    }],

    //cool-single-dialog
    uniqueKey: apiDict[apiName] + resourceName,
    // 是否显示cool-single-dialog组件 默认值固定为false 需模板生成
    dialogVisible: false,
    isDialogMethods: {
      isUpdateForm: false,
      isSaveEvent: false,
    },
    currentSelected: [],
  },
  mounted() {
    if (window.location.hash.split('#').find(p => p == 'beingSelectedPage')) this.$refs.masterView.buttons = this.$refs.masterView.buttons.splice(0, 2)
    this.$refs.masterView.dtlTableData[0].columns.map(p => {
      if (p.label == '本次到货数量' || p.label == '累计到货数量' || p.label == '剩余到货' || p.label == '到货单价') {
        p.formatter = numberToFixedFormatter
      }
    })

    // 固定格式 需模板生成
    this.$el.style.visibility = 'visible'
    console.log(this.$refs.masterView.hdrTableData.columns);
    this.$refs.masterView.hdrTableData.columns.find(p => p.label == '到货单状态').formatter = arg => {
      if (arg.status == '0') return '新建'
      if (arg.status == '1') return '已确认'
      if (arg.status == '3') return '已拒收'
    }
    axiosDict['basic'].get(`${this.urlGetEmployee}?condition=[]`)
      .then(res => {
        let options = res.filter(p=>p.departmentName=='仓储部').map(p => ({
          value: p.id,
          label: p.name
        }))
        this.$refs.masterView.queryCondition.receiver.options = options
      })
  },
  methods: {
    //cool-single-view
    tableRowClick(arg) {
      let arr = []
      axiosDict[apiName].get(`${resourceName}/GetDtlList?formno=${arg.formno}&condition=[]`)
        .then(res => {
          console.log(res)
          res.forEach(p => {
            arr.push(p)
          })
        })
        .then(() => {
          axiosDict['purchase'].get(`BillPurOrder/GetDtlList?formno=${arg.purchaseOrderNo}&condition=[]`)
            .then(res => {
              console.log(res)
              res.forEach(p => {
                arr.find(i => {
                  if (i.code == p.code) {
                    i.num2 = p.qty - p.leave
                    i.num3 = p.leave
                  }
                })
              })
              this.$refs.masterView.dtlTableData[0].data = arr
            })
        })
    },
    tableRowDblclick(arg) {

    },
    tableSelectionChange(arg) {
      this.currentSelected = arg
      if (!window.location.hash.split('#').find(p => p == 'beingSelectedPage')) {
        this.$refs.masterView.buttons.find(p => p.text == '确认').disabled = arg.length !== 1 || arg[0].status !== '0'
        this.$refs.masterView.buttons.find(p => p.text == '拒收').disabled = arg.length !== 1 || arg[0].status !== '0'
        this.$refs.masterView.buttons.find(p => p.text == '查看').disabled = arg.length !== 1
        this.$refs.masterView.buttons.find(p => p.text == '编辑').disabled = arg.length !== 1 || arg[0].status !== '0'
      }
    },
    paginationSizeChange(arg) {

    },
    paginationCurrentChange(arg) {

    },
    getCondition(arg) {

    },
    newData() {
      this.dialogs[0].showSaveButton = true
      this.dialogs[0].title = '新建到货单'
      this.dialogs[0].src = `../PurchaseArrivalHdr-maintenance/index.html#${token}#new`
      getDialog(this.dialogs,'dialog1').visible = true
    },
    editData() {
      this.dialogs[0].showSaveButton = true
      this.dialogs[0].title = '编辑到货单'
      this.dialogs[0].src = `../PurchaseArrivalHdr-maintenance/index.html#${token}#edit#${this.currentSelected[0].formno}`
      getDialog(this.dialogs,'dialog1').visible = true
    },
    confirmData() {
      this.$confirm('进行确认操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axiosDict[apiName].put(`${resourceName}/ConfirmHdr`, this.currentSelected[0])
          .then(res => {
            this.$refs.masterView.query()
          })
      }).catch(() => {})
    },
    refuseData() {
      this.$confirm('进行拒收操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axiosDict[apiName].put(`${resourceName}/Refuse`, this.currentSelected[0])
          .then(res => {
            this.$refs.masterView.query()
          })
      }).catch(() => {})
    },
    checkData() {
      this.dialogs[0].showSaveButton = false
      this.dialogs[0].title = '查看到货单'
      this.dialogs[0].src = `../PurchaseArrivalHdr-maintenance/index.html#${token}#check#${this.currentSelected[0].formno}`
      getDialog(this.dialogs,'dialog1').visible = true
    },
    // cool-single-dialog
    updateForm(arg) {

    },
    saveEvent(arg) {

    },
    dialogSaveEvent() {
      console.log('Dialog1--dialogSaveEvent');
      if (this.dialogs.find(p => p.name == 'dialog1').visible == true) {
        if (this.dialogs.find(p => p.name == 'dialog2').visible == true) {
          // console.log(document.getElementById('dialog2').contentWindow);
          let to = 'dialog1'
          let secondDialog = document.getElementById('dialog2')
          secondDialog.contentWindow.postMessage({
            method: 'postSelection',
            args: {
              to
            }
          }, '*')
        } else {
          // console.log(document.getElementById('dialog1').contentWindow);
          document.getElementById('dialog1').contentWindow.vm.maintainClick()
        }
      }
    },
    dialogBackEvent() {
      console.log('Dialog1--dialogBackEvent');
      if (this.dialogs.find(p => p.name == 'dialog1').visible == true) {
        return this.dialogs.find(p => p.name == 'dialog2').visible == true ? getDialog(this.dialogs,'dialog2').visible = !getDialog(this.dialogs,'dialog2').visible : getDialog(this.dialogs,'dialog1').visible = !getDialog(this.dialogs,'dialog1').visible
      }
    },
    //生成excel
    outputExcel(res) {
      let nameList = ['arrivalTime', 'purchaseOrderNo', 'formno', 'code', 'name', 'specifications', 'unit', 'qty', 'price', 'sum', 'smallCategory', 'supplierName', 'description']
      // let storeName = this.$refs.singleView.queryCondition.whid.options.find(p => p.value == whidValue).label
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
        .then(blob => window.saveAs(blob,  '采购到货报表.xlsx'))
        // .then(blob => window.saveAs(blob, storeName + '采购到货报表.xlsx'))
    },
    output(res) {
      // let whidValue = this.$refs.singleView.$refs.query.condition.find(p => p.FieldName == 'whid').Value[0].value
      // if (whidValue == '') this.$message('请先选择仓库后 再导出')
      // else {
        axiosDict[apiName].get(`${resourceName}/GetDtls?condition=${JSON.stringify(this.$refs.masterView.condition)}&orderBy=arrivalTime desc`)
          .then(res => {
            console.log(res)
            res.forEach(p=> {
              p.createDate = dayjs(p.createDate).format('YYYY-MM-DD')
              p.arrivalTime = dayjs(p.arrivalTime).format('YYYY-MM-DD')
              p.updateDate = dayjs(p.updateDate).format('YYYY-MM-DD')
            })
            this.outputExcel(res)
          })
      // }
    },
  }
})
