var resourceName = 'Warehouse'
var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
window.vm = new Vue({
  el: '#root',
  data: {
    urlGetList: `${resourceName}/GetList`,
    buttons: [],
    hdrTableData: {},
    formItems: {},
    formDialog: {
      title: '',
      visible: false,
      collapsed: false,
      fullscreen: false
    },
    fullEditData: [],
    updatedFormData: {},
    tableSelection: [],
  },
  computed: {
    currentFormItems() {
      return this.updatedFormData
    },
    currentSelected() {
      return this.tableSelection
    },
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
    this.searchData()
  },
  methods: {
    searchData() {
      axiosDict[apiName].get(`${this.urlGetList}?condition=[]`)
      .then(res => {
        console.log('仓库查询',res);
        this.hdrTableData.data = res
      })
    },
    getEditData() {
      this.formDialog.visible = true
      this.fullEditData = []
      axiosDict[apiName].get(`${resourceName}?id=${this.currentSelected[0].id}`)
        .then(res=> {
          this.fullEditData = res
          this.formItems.form.forEach(p => {
            p.value = res[p.name]
          })
        })
    },
    deleteData() {
      this.$confirm('此操作将删除所选数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axiosDict[apiName].delete(`${resourceName}`,{
          data: this.currentSelected[0]
        })
          .then(res=> {
            this.successTips()
            let deletedData = this.hdrTableData.data.find(p => p.id == res.id)
            this.hdrTableData.data.splice(this.hdrTableData.data.indexOf(deletedData),1)
          })
      }).catch(() => {
      })
    },
    tableSelectionChange(arg) {
      if(arg.length > 1) {
        this.$refs.coolTable.clearSelectionOuter()
        this.$refs.coolTable.$refs.table.toggleRowSelection(arg[arg.length - 1])
        this.tableSelection = [arg[arg.length - 1]]
      } else {
        this.tableSelection = arg
      }
    },
    tableRowClick(arg) {
      this.$refs.coolTable.$refs.table.toggleRowSelection(arg)
    },
    updateFormItems(arg) {
      this.updatedFormData = arg
    },
    formDialogSaveEvent() {
      if (this.$refs.formItems.validateForm()) {
        if (this.formDialog.title == '仓库编辑') {
          let currentFormItems = Object.assign(this.fullEditData,this.currentFormItems)
          axiosDict[apiName].put(`${resourceName}`,currentFormItems)
            .then(res=> {
              this.successTips()
              this.formDialog.visible = false
              // this.$refs.coolTable.clearSelectionOuter()
              let editedData = this.hdrTableData.data.find(p=> p.id == res.id)
              editedData = Object.assign(editedData,res)
            })
        }
        if(this.formDialog.title == '新建仓库') {
          axiosDict[apiName].post(`${resourceName}`,this.currentFormItems)
            .then(res=> {
              this.successTips()
              this.formDialog.visible = false
              this.$refs.coolTable.clearSelectionOuter()
              this.hdrTableData.data.unshift(res)
            })
        }
      } else return
    },
    formDialogClose() {
      this.$refs.formItems.resetForm()
    },
    buttonsevent: function(args) {
      this.formItems.form.find(p => p.label == '仓库编码').disabled = args.currentTarget.textContent.trim() == '仓库编辑'
      switch (args.currentTarget.textContent.trim()) {
        case '查询':
          {
            this.searchData()
            break
          }
        case '新建':
          {
            this.formDialog.title = '新建仓库'
            this.formDialog.visible = true
            break
          }
        case '编辑':
          {
            this.formDialog.title = "仓库编辑"
            this.updateFormItems(this.currentSelected[0])
            this.getEditData()
            break
          }
        case '删除':
          {
            this.deleteData()
            break
          }
        default:
          this.$message("未知错误！")
          break
      }
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
