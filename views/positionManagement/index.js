var resourceName = 'StoreLocation'
var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
window.vm = new Vue({
  el: '#root',
  data: {
    urlGetData: `${resourceName}/GetPageList`,
    urlGetWarehouse: `Warehouse/GetList`,
    showModeList:true,
    axiosSetting: {
      baseURL: apiDict[apiName],
    },
    uniqueDeployKey: {
      api: apiDict[apiName] + resourceName
    },
    buttons: [],
    isMethods: {
      isGetCondition: false,
      isPaginationSizeChange: true,
      isPaginationCurrentChange: true
    },
    dialogs: [{
      top: '5vh',
      name: 'dialog1',
      visible: false,
      collapse: false,
      width: '90%',
      title: '',
      src: '',
    }],
    formDialog: {
      title: '',
      visible: false,
      collapse: false,
      fullscreen: false
    },
    formItems: {},
    tableSelection: [],
    updatedFormData: {},
  },
  computed: {
    currentFormItems() {
      return this.updatedFormData
    },
    currentSelected() {
      return this.tableSelection
    }
  },
  watch: {
    currentSelected(val) {
      this.buttons.find(p => p.text == '编辑').disabled = val.length !== 1
      this.buttons.find(p => p.text == '删除').disabled = val.length !== 1
    }
  },
  mounted() {
    for (let i in window.coolLocals) {
      for (let p in JSON.parse(window.coolLocals[i])) {
        this[p] = JSON.parse(window.coolLocals[i])[p]
      }
    }
    this.$refs.singleView.singleTableData.columns.map(p => {
      if(p.label=='状态'){
        p.formatter = function(arg){
          if(arg.active == true) return '启用'
          if(arg.active == false) return '停用'
        }
      }
    })
    this.getWarehouseData()
    this.queryData()
  },
  methods: {
    getEditData() {
      this.formDialog.visible = true
      this.fullEditData = []
      axiosDict[apiName].get(`${resourceName}?id=${this.currentSelected[0].id}`)
        .then(res => {
          this.fullEditData = res
          this.formItems.form.forEach(p => {
            p.value = res[p.name]
          })
        })
    },
    getWarehouseData() {
      axiosDict[apiName].get(`${this.urlGetWarehouse}?condition=[]`)
      .then(res => {
        console.log('仓库查询',res);
        let options = res.map(p => ({
          value: p.id,
          label: p.name
        }))
        this.formItems.form.find(p=>p.label == '仓库名称').options = options
        this.$refs.singleView.queryCondition.whid.options = options
      })
    },
    searchData() {
      this.$refs.singleView.singleTableData.currentPage = 1
      this.queryData()
    },
    queryData() {
      axiosDict[apiName].get(`${this.urlGetData}?condition=${JSON.stringify(this.$refs.singleView.condition)}`, {
        params: {
          page: this.$refs.singleView.singleTableData.currentPage,
          size: this.$refs.singleView.singleTableData.pageSize,
        }
      }).then(res => {
        console.log('仓位主表查询',res);
        let data = []
        data = formatIndex(res.rows, this.$refs.singleView.singleTableData.currentPage, this.$refs.singleView.singleTableData.pageSize)
        this.$refs.singleView.singleTableData.total = res.total
        this.$refs.singleView.singleTableData.data = data
      })
    },
    newData() {
      this.getWarehouseData()
      this.formDialog.title = '新建仓位'
      this.formItems.form.find(p=>p.label == '状态').value = true
      this.formItems.form.find(p => p.label == '简码').disabled = false
      this.formDialog.visible = true
    },
    editData() {
      this.getWarehouseData()
      this.formDialog.title = "仓位编辑"
      this.formItems.form.find(p => p.label == '简码').disabled = true
      this.updateFormItems(this.currentSelected[0])
      this.getEditData()
    },
    deleteData() {
      this.$confirm('此操作将删除所选数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axiosDict[apiName].delete(`${resourceName}`,{
          data: this.currentSelected[0]
        }).then(res=>{
          this.successTips()
          if(this.$refs.singleView.singleTableData.currentPage!==1 && this.$refs.singleView.singleTableData.data.length == 1) {
            this.$refs.singleView.singleTableData.currentPage -= 1
            this.queryData()
          } else {
            let deletedData = this.$refs.singleView.singleTableData.data.find(p => p.id == res.id)
            this.$refs.singleView.singleTableData.data.splice(this.$refs.singleView.singleTableData.data.indexOf(deletedData),1)
            formatIndex(this.$refs.singleView.singleTableData.data,this.$refs.singleView.singleTableData.currentPage,this.$refs.singleView.singleTableData.pageSize)
            this.$refs.singleView.singleTableData.total --
          }
        })
      }).catch(() => {
      })
    },
    getCondition(arg) {
      console.log('getCondition', arg);
    },
    paginationSizeChange(arg) {
      this.$refs.singleView.singleTableData.currentPage = 1
      this.$refs.singleView.singleTableData.pageSize = arg
      this.queryData()
    },
    paginationCurrentChange(arg) {
      this.$refs.singleView.singleTableData.currentPage = arg
      this.queryData()
    },
    tableSelectionChange(arg) {
      if (arg.length > 1) {
        this.$refs.singleView.$refs.table.$refs.table.clearSelectionOuter()
        this.$refs.singleView.$refs.table.$refs.table.$refs.table.toggleRowSelection(arg[arg.length - 1])
        this.tableSelection = [arg[arg.length - 1]]
      } else {
        this.tableSelection = arg
      }
    },
    tableRowClick(arg) {
      this.$refs.singleView.$refs.table.$refs.table.$refs.table.toggleRowSelection(arg)
    },
    formDialogClose() {
      this.$refs.formItems.resetForm()
      // this.$refs.singleView.clearSelectionOuter()
    },
    updateFormItems(arg){
      this.updatedFormData = arg
    },
    formDialogSaveEvent() {
      if (this.$refs.formItems.validateForm()) {
        if (this.formDialog.title == '仓位编辑') {
          let currentFormItems=Object.assign(this.fullEditData,this.currentFormItems)
          axiosDict[apiName].put(`${resourceName}`,currentFormItems)
            .then(res => {
              this.successTips()
              this.formDialog.visible = false
              let editedData = this.$refs.singleView.singleTableData.data.find(p => p.id == res.id)
              editedData = Object.assign(editedData,res)
            })
        }
        if (this.formDialog.title == '新建仓位') {
          axiosDict[apiName].post(`${resourceName}`,this.currentFormItems)
            .then(res => {
              this.successTips()
              this.formDialog.visible = false
              this.$refs.singleView.clearSelectionOuter()
              this.$refs.singleView.singleTableData.data.unshift(res)
              formatIndex(this.$refs.singleView.singleTableData.data,this.$refs.singleView.singleTableData.currentPage,this.$refs.singleView.singleTableData.pageSize)
              this.$refs.singleView.singleTableData.total ++
            })
        }
      } else return
    },
    successTips() {
      Vue.prototype.$notify.success({
         title: '操作成功',
         message: '操作成功',
         duration: 3000,
       })
    },

  }
})
