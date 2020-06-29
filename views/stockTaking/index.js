//字段映射到列的关系表，格式为：字段名：列序号。如果改变列的位置，只需要修改这里的映射关系
var fieldMap = {
  code: "A",
  checkNum: "E",
};
//数据开始的行，第一行从1开始
var startRow = 2;

//导入的sheet的名称,也可以是个序号，第一个sheet从1开始
var sheetName = 0;

const RichText = XlsxPopulate.RichText

function readXLSx(file) {
  var fileData = new Blob([file]);
  var dtls = [];
  // A File object is a special kind of blob.
  return XlsxPopulate.fromDataAsync(fileData)
    .then(function(workbook) {
      var sheet = workbook.sheet(sheetName);
      var row = startRow;

      while (true) {
        var item = {};
        for (var col in fieldMap) {
          var field = fieldMap[col] + row;

          var value = sheet.cell(field).value();
          item[col] = value instanceof RichText ? value.text() : value;
        }
        //结束标记，当产品编号的内容是空白的，就跳出读取程序
        if (item["code"] == "" || item["code"] == undefined)
          break;
        dtls.push(item);
        row++;
      }
      return dtls
    });
}

var resourceName = 'Inventory'
var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
window.vm = new Vue({
  el: '#root',
  data: {
    urlGetAllData: apiDict[apiName] + '/inventory/hdr/queryList', //获取盘点表主表
    urlNewData: 'Inventory/SaveBill', //保存新建盘点表
    urlConfirm: 'Inventory/ConfirmHdr', //确认新建盘点表
    urlAdjust: 'Inventory/RepAdjust', //盘点表调账
    urlDel: apiDict[apiName] + '/inventory/hdr/delete', //删除盘点表主表
    axiosSetting: {
      baseURL: apiDict[apiName],
    },
    uniqueDeployKey: {
      api: apiDict[apiName] + resourceName
    },
    buttons: [],
    singleTableData: {},
    isMethods: {
      isGetCondition: false,
      isPaginationSizeChange: true,
      isPaginationCurrentChange: true
    },
    currentSelected: [],
    // 查询相关
    queryCondition: [],
    hdrQuery: [],
    // 新建相关
    stockCountForm: {},
    newStockCount: {
      dialogVisible: false,
      collapsed: false,
      fullscreen: false,
    },
    currentStockCountForm: {},
    // 录入盘点数
    dialogs: [{
      top: '3vh',
      name: 'dialog1',
      visible: false,
      collapse: false,
      width: '90%',
      title: '',
      src: '',
      showSaveButton: true
    }],
    // 导入相关参数
    importVisible: false,
    dialogLoading: false,
    uploadlist: [],
  },
  mounted() {
    axiosDict['basic'].get(`Employee/GetList?condition=[]`)
    .then(res => {
      this.$refs.singleView.queryCondition.confirmBy.options = res.map(p => ({
        value: p.id,
        label: p.name
      }))
    })
    axiosDict[apiName].get(`Warehouse/GetList?condition=[]`)
      .then(res => {
        console.log('仓库查询',res);
        let options = res.map(p => ({
          value: p.id,
          label: p.name
        }))
        this.$refs.singleView.queryCondition.whid.options = options
        this.stockCountForm.form.find(p => p.label == '盘点仓库').options = options
      })
    setInterval(() => {
      this.$refs.singleView.buttons.find(p => p.text == '导入盘点表').disabled = this.currentSelected.length !== 1 || this.currentSelected[0].status !== '0'
      this.$refs.singleView.buttons.find(p => p.text == '录入盘点数').disabled = this.currentSelected.length !== 1 || this.currentSelected[0].status !== '0'
      this.$refs.singleView.buttons.find(p => p.text == '确认').disabled = this.currentSelected.length !== 1 || this.currentSelected[0].status !== '0'
      this.$refs.singleView.buttons.find(p => p.text == '调账').disabled = this.currentSelected.length !== 1 || this.currentSelected[0].status !== '1'
      this.$refs.singleView.buttons.find(p => p.text == '删除').disabled = this.currentSelected.length !== 1 || this.currentSelected[0].status == '2'
    }, 0)

    for (let i in window.coolLocals) {
      for (let p in JSON.parse(window.coolLocals[i])) {
        this[p] = JSON.parse(window.coolLocals[i])[p]
      }
    }

    this.$refs.singleView.singleTableData.columns.map(p => {
      if (p.label == '盘点状态') {
        p.formatter = function(arg) {
          if (arg.status == '0') return '创建'
          if (arg.status == '1') return '已确认'
          if (arg.status == '2') return '已调账'
        }
      }
    })

    this.$el.style.visibility = 'visible'
  },
  methods: {
    queryData() {
      this.$refs.singleView.singleTableData.currentPage = 1
      this.searchData()
    },
    // 按钮操作
    searchData() {
      this.$refs.singleView.singleTableData.data = []
      // newAxios.post(this.urlGetAllData, {
      //   condition: {
      //     current: this.$refs.singleView.singleTableData.currentPage,
      //     offset: this.$refs.singleView.singleTableData.pageSize,
      //     hdr: this.hdrQuery
      //   }
      // }).then(res => {
      //   console.log('查询', res);
      //   let data = []
      //   data = formatIndex(res.data.records, this.$refs.singleView.singleTableData.currentPage, this.$refs.singleView.singleTableData.pageSize)
      //   this.$refs.singleView.singleTableData.total = res.data.total
      //   this.$refs.singleView.singleTableData.data = data
      // })

      axiosDict[apiName].get(`Inventory/GetHdrPageList?page=${this.$refs.singleView.singleTableData.currentPage}&size=${this.$refs.singleView.singleTableData.pageSize}&condition=${JSON.stringify(this.$refs.singleView.condition)}`)
        .then(res => {
          console.log('查询', res);
          let data = []
          data = formatIndex(res.rows, this.$refs.singleView.singleTableData.currentPage, this.$refs.singleView.singleTableData.pageSize)
          this.$refs.singleView.singleTableData.total = res.total
          this.$refs.singleView.singleTableData.data = data
        })
    },
    newData() {
      this.newStockCount.dialogVisible = true
    },
    importData() {
      this.importVisible = true
    },
    editData() {
      this.dialogs[0].title = `录入盘点数 —— 盘点表编号：${this.currentSelected[0].formno}`
      // ；盘点区域：${this.currentSelected[0].storeName}
      this.dialogs[0].src = `../stockTaking-maintenance/index.html#${token}#${this.currentSelected[0].formno}`
      getDialog(this.dialogs,'dialog1').visible = true
    },
    confirmData() {
      this.$confirm('进行盘点确认操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // newAxios.post(this.urlConfirm, {
        //   formno: this.currentSelected[0].formno
        // }).then(res => {
        //   console.log('确认操作完成', res);
        //   this.searchData()
        // })
        axiosDict[apiName].put(this.urlConfirm,this.currentSelected[0])
        .then(res => {
          console.log('确认操作完成', res);
          this.searchData()
        })
      }).catch(() => {
        // this.$message({
        //   type: 'info',
        //   message: '已取消操作',
        //   duration: 1000
        // });
      });
    },
    adjustData() {
      this.$confirm('进行盘点调账操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // newAxios.post(this.urlAdjust, {
        //   formno: this.currentSelected.map(p => (p.formno))
        // }).then(res => {
        //   console.log('调账操作完成', res);
        //   this.searchData()
        // })

        axiosDict[apiName].post(this.urlAdjust,this.currentSelected[0])
          .then(res => {
            console.log('调账操作完成', res);
            this.searchData()
          })
      }).catch(() => {
        // this.$message({
        //   type: 'info',
        //   message: '已取消操作',
        //   duration: 1000
        // });
      });
    },
    deleteData() {
      this.$confirm('此操作将删除所选数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // newAxios.post(this.urlDel, {
        //   delete: {
        //     hdr: this.currentSelected.map(p => (p.formno))
        //   }
        // }).then(res => {
        //   console.log('删除操作完成', res);
        //   if(this.$refs.singleView.singleTableData.currentPage!==1 && this.$refs.singleView.singleTableData.data.length == 1) {
        //     this.$refs.singleView.singleTableData.currentPage -= 1
        //     this.searchData()
        //   } else {
        //     this.searchData()
        //   }
        // })
        axiosDict[apiName].delete(`Inventory`,{
          data: this.currentSelected[0]
        }).then(res => {
          console.log('删除操作完成', res);
          if(this.$refs.singleView.singleTableData.currentPage!==1 && this.$refs.singleView.singleTableData.data.length == 1) {
            this.$refs.singleView.singleTableData.currentPage -= 1
            this.searchData()
          } else {
            let deletedData = this.$refs.singleView.singleTableData.data.find(p => p.id == res.id)
            this.$refs.singleView.singleTableData.data.splice(this.$refs.singleView.singleTableData.data.indexOf(deletedData),1)
            formatIndex(this.$refs.singleView.singleTableData.data,this.$refs.singleView.singleTableData.currentPage,this.$refs.singleView.singleTableData.pageSize)
            this.$refs.singleView.singleTableData.total --
          }
        })
      }).catch(() => {
        // this.$message({
        //   type: 'info',
        //   message: '已取消操作',
        //   duration: 1000
        // });
      });
    },

    // 主表操作
    getCondition(arg) {
      // console.log('getCondition', arg);
      // let query = []
      // query = arg.map(p => ({
      //   key: p.FieldName,
      //   value: p.DataType == 'date' ? p.Value.map(item => item.value) : p.Value[0].value,
      //   type: 'like'
      // }))
      // console.log('query', query);
      // this.hdrQuery = query
      this.$refs.singleView.singleTableData.currentPage = 1
    },
    paginationSizeChange(arg) {
      this.$refs.singleView.singleTableData.currentPage = 1
      this.$refs.singleView.singleTableData.pageSize = arg
      this.searchData()
    },
    paginationCurrentChange(arg) {
      this.$refs.singleView.singleTableData.currentPage = arg
      this.searchData()
    },
    tableSelectionChange(arg) {
      if (arg.length > 1) {
        this.$refs.singleView.$refs.table.$refs.table.clearSelectionOuter()
        this.$refs.singleView.$refs.table.$refs.table.$refs.table.toggleRowSelection(arg[arg.length - 1])
        this.currentSelected = [arg[arg.length - 1]]
      } else {
        this.currentSelected = arg
      }
    },
    tableRowClick(arg) {
      this.$refs.singleView.$refs.table.$refs.table.$refs.table.toggleRowSelection(arg)
    },
    // 新建弹窗
    updateStockCountForm(arg) {
      console.log('updateStockCountForm', arg);
      this.currentStockCountForm = arg
    },
    newStockCountDialogClose() {
      this.$refs.stockCountForm.resetForm()
    },
    createStockCount() {
      axiosDict[apiName].post(this.urlNewData, {
        hdr: {
          whid: this.currentStockCountForm.whid,
          description: this.currentStockCountForm.description
        }
      }).then(res => {
        console.log('新建完成', res)
        this.newStockCount.dialogVisible = false
        // this.searchData()
        this.$refs.singleView.singleTableData.data.unshift(res)
        formatIndex(this.$refs.singleView.singleTableData.data,this.$refs.singleView.singleTableData.currentPage,this.$refs.singleView.singleTableData.pageSize)
        this.$refs.singleView.singleTableData.total ++
      })
    },
    dialogSaveEvent() {
      document.getElementById('dialog1').contentWindow.vm.saveEditData()
    },
    dialogBackEvent() {
      getDialog(this.dialogs,'dialog1').visible = !getDialog(this.dialogs,'dialog1').visible
    },

    // 模板下载
    templateDownload() {
      saveAs(`./static/盘点模板.xlsx`,'盘点导入模板')
    },
    // 导入功能相关
    btnImport_click() {
      this.dialogLoading = true
      console.log(this.uploadlist);
      var file = this.uploadlist[0].raw
      readXLSx(file).then(rows => {
        //这里是结果，另外程序处理
        console.debug(rows);
        vm.handleImport(rows)
      })
    },
    importDialogClose() {
      this.uploadlist = []
      this.importVisible = false
    },
    handleChange(file, fileList) {
      if (fileList.length > 1) fileList.splice(0, 1)
      this.uploadlist = fileList
    },
    handleRemove(file, fileList) {
      this.uploadlist = fileList
    },
    handleImport(importData) {
      console.log('importDataimportData',importData);
      setTimeout(()=>{
        this.dialogLoading = false
        this.productInfoData = importData
        this.importVisible = false
      },500)
      let reshapeData = importData.map(p => {
        return {
          code: p.code,
          checkNum: p.checkNum
        }
      })
      axiosDict[apiName].post(`Inventory/LeadingIn`,{
        hdr:{
          formno: this.currentSelected[0].formno
        },
        dtls: reshapeData
      }).then(res => {
        console.log('导入操作成功',res);
        this.dialogLoading = false
        this.importVisible = false
      })
    },
  }
})
