var resourceName = 'StockAttribute' //资源名称 模板生成
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
      isPaginationSizeChange: true,
      isPaginationCurrentChange: true
    },
    showModeList: true,
    // 弹出框 固定格式 里面的值可按以下定义 需模板生成
    dialogs: [{
      top: '5vh',
      name: 'dialog',
      visible: false,
      collapse: false,
      width: '90%',
      title: '',
      src: '',
    }],

    //cool-single-dialog
    uniqueKey: apiDict[apiName] + resourceName,
    // 是否显示cool-single-dialog组件 默认值固定为false 需模板生成
    dialogVisible: false,
    isDialogMethods: {
      isUpdateForm: false,
      isSaveEvent: false,
    },
    condition:{
      query: [],
      page: undefined,
      size: undefined
    },

  },
  mounted() {
    // 固定格式 需模板生成
    this.$el.style.visibility = 'visible'
    this.condition.page = this.$refs.singleView.singleTableData.currentPage
    this.condition.size = this.$refs.singleView.singleTableData.pageSize
  },
  methods: {
    getDialog: function(name) {
      return this.dialogs.filter(function(dialog) {
        return dialog.name === name
      })[0]
    },
    //cool-single-view
    tableRowClick(arg) {

    },
    tableRowDblclick(arg) {

    },
    tableSelectionChange(arg) {

    },
    paginationSizeChange(arg) {
      console.log('paginationSizeChange',arg);
      this.condition.page = 1
      this.condition.size = arg
      this.searchData()
      // console.log('this.$refs.singleView.singleTableData.currentPage',this.$refs.singleView.singleTableData.currentPage);
      // console.log('this.$refs.singleView.singleTableData.pageSize',this.$refs.singleView.singleTableData.pageSize);
    },
    paginationCurrentChange(arg) {
      console.log('paginationCurrentChange',arg);
      this.condition.page = arg
      this.searchData()
    },
    getCondition(arg) {
      console.log('getCondition',arg);
      this.condition.query = arg
      this.condition.page = 1
    },
    // cool-single-dialog
    updateForm(arg) {

    },
    saveEvent(arg) {

    },
    queryData() {
      this.condition.page = 1
      this.searchData()
    },
    searchData() {
      let param ={
        condition:JSON.stringify(this.condition.query)
      }
      axiosDict[apiName].get(`StockAttribute/GetPageList?size=${JSON.stringify(this.condition.size)}&page=${JSON.stringify(this.condition.page)}`,{
        params:param
        })
        .then(res=>{
          res.rows.forEach((p,index)=>{
            p.index = (index + 1) + (this.condition.page - 1) * this.condition.size;
          })
          this.$refs.singleView.singleTableData.total = res.total
          this.$refs.singleView.singleTableData.data = res.rows
        })
    },
    printData() {
      let param ={
        condition:JSON.stringify(this.condition.query)
      }
      axiosDict[apiName].get(`StockAttribute/GetPageList?size=${JSON.stringify(2147483647)}&page=${JSON.stringify(1)}`, {
          params: param
        })
        .then(res => {
          console.log('打印信息',res);
          coolSti.view({
            token: token, //实际使用时请从window取值
            url: apiDict['system'] + 'coolSti',
            // report: 'SimpleList',
            // template: 'Report',
            report: '库存管理',
            template: '默认',
            data: res.rows,
            variables: {
              Today: new Date()
            },
            pageTitle: '库存管理打印',
            isDirectEdit: false,
            onPrintReportName: 'onPrintReport',
            // id: this.currentSelection[0].formno,
          })
        })
    },
  }
})
