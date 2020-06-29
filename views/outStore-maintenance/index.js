function alertData(args) {
  console.log('alertData', args);
  if(vm.currentOutStoreKind == '成品出仓'){
    vm.hdrFormItems.form.find(p=>p.label == '出仓申请单').value = args[0].orderCode
    vm.condition.hdr.pformno = args[0].orderCode
    // orderAxios.get(`Delivery/GetDtlList?formno=${args[0].formno}&condition=[]`)
    //   .then(res=>{
    //     vm.data = res.map(p=>({num1:p.qty,qty:p.qty,code:p.productCode,kind:'产品'}))
    //   })
    orderAxios.post(`/delivery/dtlList`,{deliveryCode:args[0].deliveryCode})
      .then(res=>{
        console.log('成品出仓明细',res);
        vm.data = res.data.records.map(p=>({num1:p.leave,qty:p.leave,code:p.id,kind:'产品',id:p.id}))
      })
  }
  if(vm.currentOutStoreKind == '领料出仓'){
    vm.hdrFormItems.form.find(p=>p.label == '出仓申请单').value = args[0].formno
    vm.condition.hdr.pformno = args[0].formno
    productionAxios.get(`/ApplyMaterial/GetBill?formno=${args[0].formno}`)
      .then(res=>{
        console.log('领料出仓明细',res);
        vm.data = res.dtls.map(p=>({num1:p.qty,qty:p.qty,code:p.code,kind:'物料',sn:p.sn}))
      })
  }
}

window.vm = new Vue({
  el: '#root',
  data: {
    // 获取编辑信息
    urlGetEditData: apiObject.warehouseURL + '/storeOut/dlt/queryList',
    // 保存新建信息
    urlConfirmData: apiObject.warehouseURL + '/storeOut/hdr/save',
    // 保存编辑信息
    urlSaveEditDate: apiObject.warehouseURL + '/storeOut/hdr/edit',
    //获取主表数据详情
    urlGetDetail: apiObject.warehouseURL + '/storeOut/hdr/queryDetail',
    // dialog
    // width:'625px',
    // labelWidth:'100px',
    // editDialogTitle:'编辑出仓单',
    // formItems:{
    //   form:[{
    //     type: 'input',
    //     value: '',
    //     label: '供应商',
    //     name: 'supplierCode',
    //     disabled: true
    //   },{
    //   name: "name",
    //   label: "产品名称",
    //   type:'input',
    //   value: '',
    //   disabled: true
    // }, {
    //   name: "code",
    //   label: "产品编码",
    //   type:'input',
    //   value: '',
    //   disabled: true
    // }, {
    //   name: "productName",
    //   label: "主材质",
    //   type:'input',
    //   value: '',
    //   disabled: true
    // },{
    //   name: "qty",
    //   label: "发货数量",
    //   type:'input',
    //   value: '',
    //   disabled: false
    // },{
    //   name: "description",
    //   label: "备注",
    //   type:'input',
    //   value: '',
    //   disabled: true
    // }]
    // },
    // newEditTableData:{
    //   data:[],
    //   tableButtons:[{
    //     text: '选取成品',
    //     size: 'mini',
    //     icon: 'el-icon-search',
    //     disabled: false
    //   },
    //   {
    //     text: '选取半成品',
    //     size: 'mini',
    //     icon: 'el-icon-search',
    //     disabled: false
    //   },
    //   {
    //     text: '选取原材料',
    //     size: 'mini',
    //     icon: 'el-icon-search',
    //     disabled: false
    //   },
    //   {
    //     text: '编辑',
    //     size: 'mini',
    //     icon: 'el-icon-edit',
    //     disabled: true
    //   },
    //   {
    //     text: '删除',
    //     size: 'mini',
    //     icon: 'el-icon-delete',
    //     disabled: true
    //   }
    // ],
    // columns:[ {
    //     type: 'selection'
    //   },{
    //   prop: 'index',
    //   label: '序号',
    //   fixed: 'fixed',
    //   type: 'index',
    //   width: '50px'
    // },
    // {
    //   prop: "",
    //   label: "编号",
    //   value: ''
    // },
    // {
    //   prop: "",
    //   label: "待出库数量",
    //   value: ''
    // },
    // {
    //   prop: "",
    //   label: "出库数量",
    //   value: ''
    // },
    // {
    //   prop: "",
    //   label: "库存数量",
    //   value: ''
    // },
    // // {
    // //   prop: "name",
    // //   label: "产品名称",
    // //   width: '160',
    // //   fixed: 'fixed',
    // //   value: ''
    // // }, {
    // //   prop: "code",
    // //   label: "产品编码",
    // //   value: ''
    // // }, {
    // //   prop: "productName",
    // //   label: "主材质",
    // //   value: ''
    // // },{
    // //   prop: "qty",
    // //   label: "发货数量",
    // //   value: ''
    // // },
    // {
    //   prop: "description",
    //   label: "备注",
    //   value: ''
    // }],
    //
    // },


    // waiting: false,
    // currentRow: undefined,
    // currentformNo: undefined,
    // formNoArray:[],
    // rawData: [],
    // ids: [],
    // selected:[],
    // cellRow: {
    //   height: '30px',
    //   padding: '5px 0'
    // },
    hdrTitle:'出仓单基础信息',
    // dltTitle:'出仓明细',
     //编辑对话框数据
    // dialogVisible: false,
    // formLabelWidth: '100px',
    // form:{},
    // currentLeave:null,//当前可编辑的数量
    // currentLeaveId:null,//可编辑的数量对应的id
    hdrFormItems: {
      form: [{
          type: 'input',
          value: '',
          label: '出仓单号',
          name: 'formno',
          readonly: true
        }, {
          type: 'select',
          value: '',
          label: '出仓仓库',
          name: 'whid',
          disabled: false,
          options: [],
          rules: {
            required: true,
            message: '此项不能为空',
            trigger: 'change'
          }
        },
        {
          type: 'select',
          value: '',
          label: '出仓类型',
          name: 'kind',
          disabled: false,
          options: [{
          value: '成品出仓'
          },
          {
            value: '领料出仓'
          },
          // {
          // value: '委外加工出仓'
          // }
          ],
          rules: {
            required: true,
            message: '出仓类型不能为空',
            trigger: 'change'
          }
        },
        {
          type: 'mixInput',
          value: '',
          label: '出仓申请单',
          name: 'pformno',
          readonly: true,
          disabled: false,
          loading: false,
          filterable: true,
          rules: {
            required: true,
            message: '出仓申请单不能为空',
            trigger: 'change'
          }
        }, {
          type: 'date',
          value: '',
          label: '出仓日期',
          name: 'operationDate',
          // style: {
          //   width: '33.3%',
          // },
          disabled: false,
          inputStyle: {
            width: '167px',
          },
          rules: {
            required: true,
            message: '入库日期不能为空',
            trigger: 'change'
          }
        },
        {
          type: 'textarea',
          value: '',
          label: '备注',
          name: 'description',
          style: 'width:100%',
          inputStyle: 'width:450px'
        }
      ]
    },
    dltFormItems: {
      form: [{
        "type": "input",
        "value": "",
        "label": "编号",
        "name": "code",
        "style": "margin-right: 5px;",
        "readonly": true,
        "disabled": false
      }, {
        "type": "inputNumber",
        "value": "",
        "label": "出库数量",
        "min": 0,
        "precision": 2,
        "name": "qty",
        "style": "margin-right: 5px;",
        "disabled": false
      }]
    },

    // productColumns: [ {
    //     type: 'selection'
    //   },{
    //   prop: 'index',
    //   label: '序号',
    //   fixed: 'fixed',
    //   type: 'index',
    //   width: '50px'
    // },
    // {
    //   prop: "name",
    //   label: "产品名称",
    //   width: '160',
    //   fixed: 'fixed',
    //   value: ''
    // }, {
    //   prop: "code",
    //   label: "产品编码",
    //   value: ''
    // }, {
    //   prop: "productName",
    //   label: "主材质",
    //   value: ''
    // },{
    //   prop: "qty",
    //   label: "发货数量",
    //   value: ''
    // },{
    //   prop: "description",
    //   label: "备注",
    //   value: ''
    // }],
    // 分页
    // total: 0,
    currentId:undefined,
    // currentNo: undefined,
    // currentIndex: null,//当前编辑数据在rawData数组中的索引
    condition:{
      hdr:{},
      dlt:[]
    },
    dltData:{
      dlt:[]
    },
    // editHdr:{},
    // maintainBtn:true,
    data: [],
    columns: [{
        type: 'index',
        label: "序号",
        width: '50px'
      }, {
        prop: "code",
        label: "编号"
      },
      {
        prop: "num1",
        label: "待出库数量",
        formatter: numberToFixedFormatter
      },
      {
        prop: "qty",
        label: "出库数量",
        formatter: numberToFixedFormatter
      },
      {
        prop: "num2",
        label: "库存数量",
        formatter: numberToFixedFormatter
      },
      {
        prop: "description",
        label: "备注"
      }],
      currentHdrForm: {},
      currentDltForm: {},
      originData: {},
      currentOutStoreKind: ''
  },
  mounted() {
    this.$el.style.visibility = 'visible'
    // let str = window.location.hash
    // this.currentId = str.split(/[#?]/)[1]
    this.currentId = id
    console.log(this.currentId);
    if (this.currentId != undefined) {
      this.hdrFormItems.form.find(p=>p.label == '出仓类型').disabled = true
      this.hdrFormItems.form.find(p=>p.label == '出仓申请单').disabled = true
      this.hdrFormItems.form.find(p=>p.label == '出仓日期').disabled = true
      this.getQueryDetail()
    }

    newAxios.post(`/store/hdr/queryList`,{
      condition:{hdr:[]}
    })
      .then(res=>{
        this.hdrFormItems.form.find(p=>p.label == '出仓仓库').options = res.data.records.map(p=>({value:p.id,label:p.name}))
      })
  },
  // watch: {
  //   'newEditTableData.data':function(val) {
  //     this.maintainBtn = val.length === 0
  //     if(val.find(p=> p.kind == '成品')) {
  //       this.newEditTableData.tableButtons.find(p=> p.text == '选取半成品').disabled = true
  //       this.newEditTableData.tableButtons.find(p=> p.text == '选取原材料').disabled = true
  //     }
  //     if(val.find(p=> p.kind == '半成品')) {
  //       this.newEditTableData.tableButtons.find(p=> p.text == '选取成品').disabled = true
  //       this.newEditTableData.tableButtons.find(p=> p.text == '选取原材料').disabled = true
  //     }
  //     if(val.find(p=> p.kind == '原材料')) {
  //       this.newEditTableData.tableButtons.find(p=> p.text == '选取半成品').disabled = true
  //       this.newEditTableData.tableButtons.find(p=> p.text == '选取成品').disabled = true
  //     }
  //   },
  // },
  methods: {
    inputBtnEvent(){
      window.parent.vm.dialogs[1].title = `选择出仓申请单`
      if(this.currentOutStoreKind == '成品出仓'){
        // window.parent.vm.dialogs[1].src = `${serveObject.saleModuleURL}DeliveryHdr/index.html#${token}#`
        window.parent.vm.dialogs[1].src = `${serveObject.saleModuleURL}../saleManage/invoice/index.html#${token}##beingSelectedPage`
        getDialog(window.parent.vm.dialogs,'dialog2').visible = !getDialog(window.parent.vm.dialogs,'dialog2').visible
      }else if(this.currentOutStoreKind == '领料出仓'){
        window.parent.vm.dialogs[1].src = `${serveObject.productionModuleURL}ApplyMaterial/index.html#${token}#OutStore#beingSelectedPage`
        getDialog(window.parent.vm.dialogs,'dialog2').visible = !getDialog(window.parent.vm.dialogs,'dialog2').visible
      }else {
        Vue.prototype.$message({
          type: 'warning',
          message: '请先选择出仓类型',
          duration: 3000
        })
      }
    },
    confirmBtn(){
      this.data.find(p => {
        if (p.code == this.currentDltForm.code) {
          for (item in this.currentDltForm) p[item] = this.currentDltForm[item]
        }
      })
    },
    // 获取编辑信息
    getEditData() {
      let obj = {
        takeData:this.data
      }
      coolAxios(this.urlGetEditData,{condition:this.dltData},this,obj)
    },
    getQueryDetail(){
      let fn = (res)=>{
        this.originData = JSON.parse(JSON.stringify(res.data))
        for (item in res.data) {
          this.hdrFormItems.form.forEach(p => {
            if (p.name == item) p.value = res.data[item]
          })
        }
        // this.editHdr = Object.assign(res.data,this.editHdr)
        // this.hdrFormItems.form[0].value = res.data.operationDate
        // this.hdrFormItems.form[1].value = res.data.description
        this.dltData.dlt.push({'key':'formNo','value':res.data.formno})
        this.getEditData()
      }
      coolAxios(this.urlGetDetail,{formno:this.currentId},this,fn)
    },
    // 申请单请求
    // getApplicationForm(arg) {
    //   this.hdrFormItems.form.find(p => p.label == '出仓申请单').loading = true
    //   if (arg == '成品出仓') {
    //     // this.hdrFormItems.form.find(p => p.label == '出仓申请单').loading = true
    //     orderAxios.get(`Delivery/GetHdrPageList?condition=[]&page=1&size=100000`)
    //       .then(res=>{
    //         this.hdrFormItems.form.find(p => p.label == '出仓申请单').options = res.rows.map(p=>({value: p.formno}))
    //         this.hdrFormItems.form.find(p => p.label == '出仓申请单').loading = false
    //       })
    //   }
    //   if (arg == '领料出仓') {
    //     productionAxios.get(`/ApplyMaterial/GetList?condition=[{"FieldName":"Tag","TableName":"[Dtl]","Value":[{"value":false}],"TableRelationMode":"AND","Mode":"为空","DataType":"boolean"}]`)
    //       .then(res=>{
    //         this.hdrFormItems.form.find(p => p.label == '出仓申请单').options = res.map(p=>({value: p.formno}))
    //         this.hdrFormItems.form.find(p => p.label == '出仓申请单').loading = false
    //       })
    //   }
    //   if (arg == '委外加工出仓') {}
    // },
    updateHdrForm(obj, arg, label) {
      this.currentHdrForm = obj
      if (label == '出仓类型') {
        this.currentOutStoreKind = arg
        this.data = []
        this.hdrFormItems.form.find(p => p.label == '出仓申请单').options = []
        this.hdrFormItems.form.find(p => p.label == '出仓申请单').value = ''
        // this.getApplicationForm(arg)
      }
      if(label == '出仓申请单') {
        // if(obj.kind == '成品出仓'){
        //   orderAxios.get(`Delivery/GetDtlList?formno=${arg}&condition=[]`)
        //     .then(res=>{
        //       this.data = res.map(p=>({num1:p.qty,qty:p.qty,code:p.productCode,kind:'产品'}))
        //     })
        // }
        // if(obj.kind == '领料出仓'){
        //   productionAxios.get(`/ApplyMaterial/GetBill?formno=${arg}`)
        //     .then(res=>{
        //       console.log('领料出仓明细',res);
        //       this.data = res.dtls.map(p=>({num1:p.qty,qty:p.qty,code:p.code,kind:'物料'}))
        //     })
        // }
      }
      // this.editHdr.description = arg.description
    },
    updateDltForm(arg) {
      console.log(arg);
        this.currentDltForm = arg
    },
    // 取消按钮
    cancelClick() {
      getDialog(window.parent.vm.dialogs,'dialog1').visible = !getDialog(window.parent.vm.dialogs,'dialog1').visible
    },
    // 保存按钮方法
    maintainClick(){
      if (this.$refs.hdrFormItems.validateForm()) {
          if (this.data.some(p=>p.qty>p.num1||p.qty<=0)) {
            return Vue.prototype.$notify.warning({
                title: '注意',
                message: '出仓明细中出库数量存在问题',
                duration: 2000,
              })
          } else {
              // if (this.currentId != undefined) {
              //   console.log('编辑状态');
              // } else {
              //   console.log('新建状态');
              this.condition.type = 'fill'
              // this.condition.hdr = this.currentHdrForm
              this.condition.hdr = Object.assign(this.originData, this.currentHdrForm)
              this.data.map(p=>{
                p.leave = JSON.parse(JSON.stringify(p.qty))
              })
              this.condition.dlt = this.data
              let fn = res => {
                getDialog(window.parent.vm.dialogs,'dialog1').visible = !getDialog(window.parent.vm.dialogs,'dialog1').visible
                window.parent.vm.getHdrData()
              }

              if (this.currentId == undefined) {
                coolAxios(this.urlConfirmData, {
                  save: this.condition
                }, this, fn)
              } else {
                coolAxios(this.urlSaveEditDate, {
                  edit: this.condition
                }, this, fn)
              }
          }
        } else return
      },
      rowClick (arg){
        this.dltFormItems.form.find(p => p.label == '编号').value = arg.code
        this.dltFormItems.form.find(p => p.label == '出库数量').value = arg.qty
      },

    // 当数据编辑到最后一条 弹出提示框
     // comfirmEditData() {
     //    this.$confirm('数据已经编辑到最后一条了, 是否保存退出?-', '提示', {
     //      confirmButtonText: '确定',
     //      cancelButtonText: '取消',
     //      type: 'warning'
     //    }).then(() => {
     //      this.saveData()
     //      this.$message({
     //        type: 'success',
     //        message: '保存成功!',
     //        duration:1000
     //      });
     //    }).catch(() => {
     //      this.currentIndex = this.newEditTableData.data.length - 1
     //      this.$message({
     //        type: 'info',
     //        message: '已取消！',
     //        duration:1000
     //      });
     //    });
     //  },
   // 按上键回到上一条数据
    // backUp(){
    //   this.currentIndex--
    //   if(this.currentIndex < 0){
    //     this.$message.warning('当前数据为第一条数据')
    //     this.currentIndex =  0
    //     // console.log(this.currentIndex)
    //   }else{
    //     this.changeInputData()
    //   }
    // },
    // 按下键切换到下一条数据
    // backDown(){
    //   console.log(8)
    //  this.currentIndex++
    //   if(this.currentIndex >= this.newEditTableData.data.length){
    //     // this.$message.warning('数据已经编辑到最后一条了')
    //     // this.currentIndex = this.newEditTableData.data.length - 1
    //     // console.log(this.currentIndex)
    //     if(this.currentIndex == this.newEditTableData.data.length){
    //       this.comfirmEditData()
    //     }
    //   }else{
    //     this.changeInputData()
    //   }
    // },
     //敲回车保存当前编辑数据 并切换下一条数据
    // nextInputData(){
    //   this.changeEditData(this.backDown)
    // },
    // 编辑弹出窗确定按钮的方法
    // saveData(){
    //   this.changeEditData(this.closeEdit)
    // },

    // closeEdit(){
    //   this.dialogVisible = false
    // },
    //切换输入框内容的方法
    // changeInputData(){
    //   // this.currentLeave = this.newEditTableData.data[this.currentIndex].qty
    //   this.formItems.form[4].value = this.newEditTableData.data[this.currentIndex].qty
    //   this.currentLeaveId = this.newEditTableData.data[this.currentIndex].id
    //   for(i in this.newEditTableData.data[this.currentIndex]){
    //       this.formItems.form.forEach(p =>{
    //         if(p.name == i){
    //           p.value = this.newEditTableData.data[this.currentIndex][i]
    //         }
    //       })
    //     }
    //     // console.log(this.newEditTableData.data,this.currentIndex)
    // },
   // 编辑弹出窗确定按钮的方法 因两处均有用到 遂简易封装
    // changeEditData(callback){
    //    let reg = /^[0-9]*$/;
    //   if (!reg.test(this.formItems.form[4].value) || this.formItems.form[4].value == '') {
    //     alert('请留个数字再走吧!')
    //   return false;
    //   }else{
    //     // console.log('是数字吧')
    //     this.newEditTableData.data = this.newEditTableData.data.map((item,index) => {
    //     if(item.id == this.currentLeaveId){
    //       console.log(this.formItems.form[4].value,this.newEditTableData.data)
    //       item.leave =this.formItems.form[4].value
    //       item.qty = item.leave
    //       return item;
    //     }else {
    //       return item;
    //     }
    //   })
    //    callback()
    //   }
    // },
    // 双击显示编辑弹窗
    // rowDblclick(arg){
    //    // this.currentLeave =arg.qty
    //    this.formItems.form[4].value =arg.qty
    //    this.currentLeaveId = arg.id
    //    this.newEditTableData.data.map((item,index)=>{
    //       if(arg.id == item.id){
    //         this.currentIndex = index
    //         //取出当前双击行的index
    //       for(i in item){
    //       this.formItems.form.forEach(p =>{
    //         if(p.name == i){
    //           p.value = item[i]
    //         }
    //       })
    //     }
    //       }
    //    })
    //    this.dialogVisible = true
    //    // console.log(arg,this.currentLeave,this.currentLeaveId,this.currentIndex)
    // },
    // backEvent(){
    //   this.dialogVisible=false
    // },
    // 查询按钮的方法
    // searchData(type) {
    //   window.parent.vm.dialogs[1].src = `invocieReview.html#${token}#${encodeURIComponent(type)}`
    //   setTimeout(() => {
    //     getDialog(window.parent.vm.dialogs,'dialog2').visible = !getDialog(window.parent.vm.dialogs,'dialog2').visible
    //   }, 100)
    // },
   // 保存编辑信息
    // saveEditData() {
    //   this.editHdr.description = this.hdrFormItems.form[1].value
    //   console.log(this.editHdr.description)
    //   this.editHdr.operationDate =dayjs(this.hdrFormItems.form[0].value).format("YYYY-MM-DD")
    //   let params = {
    //     edit:{
    //         hdr:this.editHdr,
    //         dlt:this.newEditTableData.data
    //       }
    //     }
    //   let obj = {
    //     msg:true,
    //     fn:res=>{
    //       setTimeout(()=>{
    //          getDialog(window.parent.vm.dialogs,'dialog1').visible = !getDialog(window.parent.vm.dialogs,'dialog1').visible
    //          window.parent.vm.getAllData()
    //       },800)
    //     }
    //   }
    //   coolAxios(this.urlSaveEditDate,params,this,obj)
    // },
     // 保存信息
    // confirmData() {
    //   this.condition.hdr.kind = '成品'
    //   this.condition.hdr.description = this.hdrFormItems.form[1].value
    //   this.condition.hdr.operationDate = dayjs(this.hdrFormItems.form[0].value).format("YYYY-MM-DD")
    //   this.condition.dlt = this.newEditTableData.data
    //   let fn = res=>{
    //     getDialog(window.parent.vm.dialogs,'dialog1').visible = !getDialog(window.parent.vm.dialogs,'dialog1').visible
    //     window.parent.vm.getAllData()
    //   }
    //   coolAxios(this.urlConfirmData,{save:this.condition},this,fn)
    // },
    // 删除进仓单
    // delTab() {
    //   this.items.forEach(p => {
    //     this.newEditTableData.data.splice(this.newEditTableData.data.indexOf(p), 1)
    //   })
    // },
       // 表格多选操作
    // selection(arg) {
    //   this.newEditTableData.tableButtons[1].disabled = arg.length === 0
    //   this.newEditTableData.tableButtons[2].disabled = arg.length === 0
    //   if (arg.length != 0) {
    //       this.items = []
    //       this.formNoArray = []
    //     this.selected = arg
    //     this.selected.forEach(p => {
    //       this.items.push(p)
    //     })
    //     for(i in this.selected[0]){
    //       this.formItems.form.forEach(p =>{
    //         if(p.name == i){
    //           p.value = this.selected[0][i]
    //         }
    //       })
    //     }
    //     this.currentLeave = this.selected[0].qty
    //     this.currentLeaveId = this.selected[0].id
    //     // console.log(this.currentLeave,this.currentLeaveId,this.selected[0])
    //   }
    //   else this.selected = []
    // },
  // paginationSizeChange(arg) {
  //     this.condition.current = 1
  //     this.condition.offset = arg
  //   },
  //   paginationCurrentChange(arg) {
  //     this.condition.current = arg
  //   },

    // 按钮点击事件
    // buttonsevent: function(args) {
    //   switch (args.currentTarget.textContent) {
    //     case '选取成品':
    //       {
    //          this.searchData('成品');
    //         break
    //       }
    //     case '选取半成品':
    //       {
    //          this.searchData('半成品');
    //         break
    //       }
    //     case '选取原材料':
    //       {
    //          this.searchData('原材料');
    //         break
    //       }
    //      case '编辑':
    //       {
    //         this.dialogVisible = true
    //         break
    //       }
    //     case '删除':
    //       {
    //         this.delTab()
    //         break
    //       }
    //     default:
    //       console.log("！未知错误！")
    //       break
    //   }
    // },
  }
})
