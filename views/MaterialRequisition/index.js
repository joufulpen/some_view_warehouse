function passSelection({
  to,
  data
}) {
  console.log(data)
  document.getElementById(to).contentWindow.postMessage({
    method: 'alertData',
    args: data
  }, '*')
  if (vm.dialogs[0].title == '选择领料计划单号') {
    if (data.length == 1) {
      vm.applyFormItems.form.find(p => p.name == 'pFormno').value = data[0].formno
      vm.applyFormItems.form.find(p => p.name == 'receivingDepartment').value = data[0].departmentName
      vm.applyFormItems.form.find(p => p.name == 'receivingPerson').value = data[0].employeeName
      vm.hasChooseFormno = data[0].formno
      if (data[0].formno != '') vm.chooseItem()
      vm.coolFormData = Object.assign(vm.coolFormData, {
        receivingPerson: data[0].employeeName,
        receivingDepartment: data[0].departmentName
      })
      vm.orderNo = data[0].pFormno
      vm.inTableData = []
      vm.dialogs[0].visible = !vm.dialogs[0].visible
    } else {
      vm.$message('抱歉 只能选一条数据')
    }
  } else {
    if (data.hasOwnProperty('closeDialog') && to == 'dialog') {

      // let filterData = data.data.filter(a => !vm.inTableData.map(b => b.guid).includes(a.guid)).map(a => { return a })
      data.data.map(item => {
        // axiosDict['production'].get(vm.uniqueKey + '/NewDtl').then(res=>{
        // console.log(res)
        // if(res){
        axiosDict['warehouse'].get(`StockAttribute?id=${item.code}`)
        .then(res => {
          if (res) item.description = res.description
          let copyData = JSON.parse(JSON.stringify(vm.newDtlItem))
          delete item.guid
          delete item.ts
          item.qty = item.leave
          item.formno = ''
          let newData = Object.assign(copyData, item)
          newData.parentSn = newData.sn
          newData.sn = null
          vm.inTableData.push(newData)
        })
        // }
        // })
      })
      setTimeout(() => {
        vm.dialogs[0].visible = !vm.dialogs[0].visible
      }, 500)
    }
  }
}

function getSelection({
  from,
  to
}) {
  document.getElementById(from).contentWindow.postMessage({
    method: 'postSelection',
    args: {
      to
    }
  }, '*')
}

var resourceName = 'ApplyMaterial' //资源名称 模板生成
var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
window.vm = new Vue({
  el: '#root',
  data: {
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
    },
    showModeList: true,
    // 弹出框 固定格式 里面的值可按以下定义 需模板生成
    dialogs: [{
      top: '3vh',
      name: 'dialog',
      visible: false,
      collapse: false,
      width: '90%',
      title: '',
      src: '',
      saveBtnText: "确 认",
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
    dialogTitle: '新增领料单',
    showSaveButton: true,
    justDialogWidth: "1050px",
    labelWidth: '115px',
    applyFormItems: {
      form: [{
        "type": "input",
        "value": "",
        "label": "领料单号",
        "name": "formno",
        "inputStyle": {
          "width": "193px"
        },
        "readonly": true,
        "disabled": true,
        "style": {
          "width": "50%"
        }
      }, {
        "type": "input",
        "value": "",
        "label": "领料人",
        "name": "receivingPerson",
        "inputStyle": {
          "width": "193px"
        },
        "readonly": true,
        "disabled": true,
        "style": {
          "width": "50%"
        }
      }, {
        "type": "input",
        "value": "",
        "label": "领料部门",
        "name": "receivingDepartment",
        "inputStyle": {
          "width": "193px"
        },
        "readonly": true,
        "disabled": true,
        "style": {
          "width": "50%"
        }
      }, {
        "type": "select",
        "options": [],
        "value": "",
        "label": "出仓仓库",
        "name": "whid",
        "inputStyle":{
          "width":"193px"
        },
        "readonly": false,
        "disabled": false,
        "style": {
          "width": "50%"
        },
        "rules": {
          "required": true,
          "message": "出仓仓库不能为空",
          "trigger": "change"
        }
      }, {
        "type": "mixInput",
        "value": "",
        "label": "领料计划单号",
        "name": "pFormno",
        "readonly": true,
        "disabled": false,
        "inputStyle": {
          "width": "193px"
        },
        "style": {
          "width": "50%"
        },
        "rules": {
          "required": true,
          "message": "领料计划单号不能为空",
          "trigger": "change"
        }
      }, {
        "type": "input",
        "value": "",
        "label": "备注",
        "inputStyle": {
          "width": "193px"
        },
        "name": "description",
        "readonly": false,
        "disabled": false,
        "style": {
          "width": "50%"
        }
      }]
    },
    coolFormData: {},
    orderNo: '',
    buttons: [{
      text: "选择明细",
      size: "mini",
      icon: "#iconxuanze",
      disabled: false,
      type: "success"
    }, {
      text: "编辑",
      size: "mini",
      icon: "#iconERP_bianji",
      disabled: true,
      type: "primary"
    }, {
      text: "移除",
      size: "mini",
      icon: "#iconERP_shanchu",
      disabled: true,
      type: "danger"
    }],
    selectionData: [],
    alreadyDelData: [],
    inTableData: [],
    addTableData: {},
    columns: [{
        "type": "selection",
        "width": '55px'
      },
      {
        "prop": "code",
        "label": "编号"
      },
      {
        "prop": "codeName",
        "label": "名称"
      },
      {
        "prop": "specifications",
        "label": "规格"
      },
      {
        "prop": "leave",
        "label": "待领取数量"
      },
      {
        "prop": "qty",
        "label": "本次领取数量"
      },
      {
        "prop": "unit",
        "label": "物料主单位"
      },
      {
        "prop": "description",
        "label": "备注"
      }
    ],
    quickDialogVisible: false,
    dialogWidth: '400px',
    labelWidth: '100px',
    currentEditData: {},
    quickCoolFormItems: {
      form: [{
        "type": "input",
        "value": "",
        "label": "编号",
        "disabled": true,
        "name": "code",
        "style": {
          "width": "100%"
        }
      }, {
        "type": "input",
        "value": "",
        "label": "名称",
        "disabled": true,
        "name": "codeName",
        "style": {
          "width": "100%"
        }
      }, {
        "type": "input",
        "value": "",
        "label": "规格",
        "disabled": true,
        "name": "specifications",
        "style": {
          "width": "100%"
        }
      }, {
        "type": "inputNumber",
        "value": "",
        "label": "本次领取数量",
        "inputStyle": {
          "width": "193px"
        },
        "min": 0,
        "disabled": false,
        "name": "qty",
        "style": {
          "width": "100%"
        }
      }, {
        "type": "input",
        "value": "",
        "label": "备注",
        "disabled": false,
        "name": "description",
        "style": {
          "width": "100%"
        }
      }]
    },
    rowDblclickData: {},
    tableHeight: '300px',
    stripe: true,
    selectData: [],
    isEdit: false,
    hdrNewItem: {},
    allData: [],
    isCheck: false,
    hasChooseFormno: '',
    newDtlItemd: {},
    currentRow:null,
  },
  watch: {
    isCheck(arg) {
      this.applyFormItems.form.map(item => item.disabled = arg)
      this.coolFormItems.form.map(item => item.disabled = arg)
      this.buttons.find(p => p.text == '选择明细').disabled = arg
    },
    // rowDblclickData(arg) {
    //   this.coolFormItems.additionButtons.buttons[0].disabled = arg == null
    // },
    currentRow(arg){
      console.log(arg)
      this.buttons.find(p => p.text == '编辑').disabled = arg == null
    },
    selectionData(arg){
      console.log(arg)
      this.buttons.find(p => p.text == '移除').disabled = arg.length === 0
    }
  },
  mounted() {
    // 固定格式 需模板生成
    this.$el.style.visibility = 'visible'
    axiosDict[apiName].get(this.uniqueKey + '/NewDtl').then(res => {
      this.newDtlItem = res
      delete this.newDtlItem.guid
    })
  },
  methods: {
    chooseFormno() {
      this.dialogs[0].title = '选择领料计划单号'
      this.dialogs[0].src = `${serveDict['productionURL']}ApplyMaterial/index.html#${token}#id#chooseFormno`
      setTimeout(() => {
        getDialog(this.dialogs, 'dialog').visible = true
      }, 100)
    },
    chooseItem() {
      this.dialogs[0].title = '选择明细'
      this.dialogs[0].src = `${serveDict['productionURL']}chooseMaterial/index.html#${token}#id#${this.applyFormItems.form.find(p=>p.name == 'pFormno').value}#apply#alreadyChooseData=${window.encodeURIComponent(JSON.stringify(this.inTableData))}`
      setTimeout(() => {
        getDialog(this.dialogs, 'dialog').visible = true
      }, 100)
    },
    dialogSaveEvent() {
      var to = 'dialog'
      let secondDialog = document.getElementById('dialog')
      console.log(secondDialog)
      secondDialog.contentWindow.postMessage({
        method: 'postSelection',
        args: {
          to
        }
      }, '*')
    },
    dialogBackEvent() {
      getDialog(this.dialogs, 'dialog').visible = false
    },
    rowDblclick(arg) {
      this.quickEditEvent(this.currentRow)
    },
    quickEditEvent(arg) {
      this.currentEditData = arg
      this.quickDialogVisible = true
      this.quickCoolFormItems.form.forEach(item => {
        for (let i in arg) {
          if (i == item.name) item.value = arg[i]
        }
      })
      this.$refs.tableView.clearCurrentRow()
      this.currentRow = null
    },
    outSelection(arg) {
      this.selectionData = arg
      console.log(this.selectionData)
      // if (arg.length != 0) {
      //   this.selectionData = []
      //   arg.map(item => {
      //     this.selectionData.push(item)
      //   })
      // }
    },
    outRowClick(arg) {
      this.currentRow = arg
      console.log( this.currentRow)
    },
    buttonClick(args) {
      switch (args.currentTarget.textContent.trim()) {
        case '选择明细':
          {
            if (this.applyFormItems.form.find(p => p.name == 'pFormno').value !== '') {
              this.chooseItem()
            } else {
              this.$message.warning('请先选择领料计划单号 谢谢')
            }
            break
          }
        case '移除':
          {
            this.selectionData.forEach(p => {
              if (p.ts !== null) {
                p.recStatus = 2
                p.deleted = true
                this.alreadyDelData.push(p)
              }
              this.inTableData.splice(this.inTableData.indexOf(p), 1)
            })
            this.$refs.tableView.clearSelectionOuter()
            this.$refs.tableView.clearCurrentRow()
            this.currentRow = null
            break;
          }
        case '编辑':
          {
            this.quickEditEvent(this.currentRow)
          }
        default:
          break;
      }
    },
    masterUpdateForm(arg) {
      this.coolFormData = arg
      console.log(this.coolFormData)
    },
    newCustom() {
      this.dialogVisible = true
      this.isEdit = false
      axiosDict['warehouse'].get(`Warehouse/GetList?condition=[]`)
      .then(res => {
        console.log('仓库查询',res);
        let options = res.map(p => ({
          value: p.id,
          label: p.name
        }))
        this.applyFormItems.form.find(p => p.label == '出仓仓库').options = options
      })

      axiosDict[apiName].get(`ApplyMaterial/NewHdr`).then(res => {
        console.log(res)
        this.hdrNewItem = res
      })
    },
    looking() {

    },
    //cool-single-view
    tableRowClick(arg) {

    },
    tableRowDblclick(arg) {

    },
    tableSelectionChange(arg) {

    },
    paginationSizeChange(arg) {

    },
    paginationCurrentChange(arg) {

    },
    getCondition(arg) {

      },
    // cool-single-dialog
    updateForm(arg) {

    },
    saveEvent(arg) {
      if (this.$refs.coolForm.validateForm()) {
        if (this.inTableData.length) {
          let allFormData = {}
          // 判断编辑还是新建
          this.coolFormData.orderNo = this.orderNo
          this.coolFormData.pFormno = this.hasChooseFormno
          allFormData = Object.assign(this.hdrNewItem, this.coolFormData)
          console.log(allFormData)
          let param
          this.inTableData.map(item => {
            item.whid = this.applyFormItems.form.find(p => p.name == 'whid').value
          })
          param = {
            "hdr": allFormData,
            "dtls": this.inTableData
          }
          console.log(param)
          axiosDict[apiName].post(this.uniqueKey + '/SaveBill', param).then(res => {
            console.log(res)
            if (res) {
              // 新建 直接push进去表格数据中 感觉新建完的数据应该在第一条
              Vue.prototype.$notify.success({
                title: '新增数据成功',
                message: '新增数据成功',
                duration: 2000,
              })
              this.$refs.masterView.hdrTableData.data.unshift(res)
              allFormData = null
              this.backEvent()
            }
          })
        } else {
          this.$message({
            type: 'warning',
            message: '必须输入单据明细',
            duration: 1500
          });
        }
      }
    },
    backEvent() {
      this.$refs.coolForm.clearForm()
      this.$refs.coolForm.resetForm()
      this.inTableData = []
      this.alreadyDelData = []
      this.rowClickData = null
      this.dialogVisible = false
      this.isCheck = false
    },

    //生成excel
    outputExcel(res) {
      let nameList = ['formno', 'updateDate', 'code', 'codeName', 'specifications', 'materialSubclass', 'qty', 'unit', 'listerName', 'departmentName', 'updateName', 'WarehouseName', 'description']
      axios
        .get('template.xlsx', {
          responseType: 'blob'
        })
        .then(rTemplate => window.XlsxPopulate.fromDataAsync(rTemplate.data))
        .then(workbook => {
          let sheet = workbook.sheet('Sheet')
          let packages = Array.from(res)
          let row = 1
          packages.forEach(pack => sheet.cell(++row, 1).value([nameList.map(name => pack[name])]))
          return workbook.outputAsync()
        })
        .then(blob => window.saveAs(blob, '领料出仓报表.xlsx'))
    },
    output(res) {
      axiosDict[apiName].get(`ApplyMaterial/GetApplyMaterial?condition=${JSON.stringify(this.$refs.masterView.condition)}`)
        .then(res => {
          console.log(res)
          res.forEach(p=> {
            p.createDate = dayjs(p.createDate).format('YYYY-MM-DD')
            p.billDateTime = dayjs(p.billDateTime).format('YYYY-MM-DD')
            p.updateDate = dayjs(p.updateDate).format('YYYY-MM-DD')
          })
          this.outputExcel(res)
        })
    },
  }
})
