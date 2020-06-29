function alertData(args) {
  console.log('alertData', args);
  vm.$refs.editView.hdrFormItems.form.find(p=>p.label == '进仓申请单').value = args[0].formno
  if (vm.currentInStoreKind == '采购到货进仓') {
    newWarehouseAxios.get(`/PurchaseArrival/GetDtlList?formno=${args[0].formno}&condition=[]`)
      .then(res => {
        res.forEach(p=>{
          p.storeDltId = ''
        })
        vm.$refs.editView.dtlTable.data = res
      })
  }
  if (vm.currentInStoreKind == '成品进仓') {

  }
}

var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
window.vm = new Vue({
  el: '#root',
  data: {
    hdrTitle: '进仓单基础信息',
    hdrLabelWidth: '100px',
    dtlTitle: '进仓明细',
    dtlLabelWidth: '50px',

    urlDataMaintenance: '',
    currentId: '',
    currentInStoreKind: '',
    currentDtlForm: {},
  },
  mounted() {
    let _this = this.$refs.editView
    // for (let i in window.coolLocals) {
    //   for (let p in JSON.parse(window.coolLocals[i])) {
    //     this[p] = JSON.parse(window.coolLocals[i])[p]
    //   }
    // }
    _this.dtlTable.columns.map(p => {
      if(p.label == '入库数量') p.formatter = numberToFixedFormatter
    })

    // setInterval(()=>{
    //   _this.dtlFormItems.additionButtons.buttons.find(p=>p.text == '确 定').disabled = _this.dtlFormItems.form.find(p=>p.label=='编号').value.length==0|| this.currentId !== undefined
      // _this.dtlFormItems.form.find(p=>p.label=='仓位').value.length==0||
    // },0)

    // _this.dtlTable.columns.find(p=>p.label == '仓位').formatter = arg => {
    //   if (arg.storeDltId) {
    //     let storeDltId = _this.dtlFormItems.form.find(p => p.label == '仓位').options.find(item=>item.value == arg.storeDltId).label
    //     return storeDltId
    //   }
    // }

    this.$el.style.visibility = 'visible'
    this.urlDataMaintenance = `/storeIn/hdr/save`
    this.currentId = id
    // 获取仓库选项
    axiosDict[apiName].get(`Warehouse/GetList?condition=[]`)
    .then(res => {
      console.log('仓库查询',res);
      let options = res.map(p => ({
        value: p.id,
        label: p.name
      }))
      this.$refs.editView.hdrFormItems.form.find(p=>p.label == '仓库').options = options
    })
    // 编辑状态
    if(this.currentId != undefined){
      this.urlDataMaintenance = `/storeIn/hdr/edit`
      _this.hdrFormItems.form.find(p=>p.label == '备注').readonly = true
      _this.hdrFormItems.form.find(p=>p.label == '进仓类型').disabled = true
      // _this.hdrFormItems.form.find(p=>p.label == '进仓申请单').disabled = true
      // _this.hdrFormItems.form.find(p=>p.label == '进仓申请单').buttonDisabled = true
      _this.hdrFormItems.form.find(p=>p.label == '进仓日期').disabled = true
      _this.hdrFormItems.form.find(p=>p.label == '仓库').disabled = true
      // _this.dtlFormItems.form.find(p=>p.label == '仓位').disabled = true
      this.getEditData()
    }
  },
  methods: {
    // 获取编辑信息
    getEditData() {
      let _this = this.$refs.editView
      axiosDict[apiName].get(`StoreIn/GetBill?formno=${this.currentId}`)
        .then(res => {
          console.log('获取进仓单信息',res);
          for (item in res.hdr) {
            _this.hdrFormItems.form.forEach(p => {
              if (p.name == item) p.value = res.hdr[item]
            })
          }
          _this.dtlTable.data = res.dtls
        })
    },
    // 维护操作
    maintainData() {
      let _this = this.$refs.editView
      let obj = {}
      _this.hdrFormItems.form.forEach(p => {
        obj[p.name] = p.value
      })
      let fn = () => {
        getDialog(window.parent.vm.dialogs,'dialog1').visible = !getDialog(window.parent.vm.dialogs,'dialog1').visible
        window.parent.vm.getHdrData()
      }
      let saveData = {
        hdr: obj,
        dlt: _this.dtlTable.data
      }
      if(obj.kind !== '采购到货进仓') saveData.type = 'fill'
      if (this.urlDataMaintenance == `/storeIn/hdr/save`) {
        coolAxios(this.urlDataMaintenance, {save: saveData}, this, fn)
      } else {
        coolAxios(this.urlDataMaintenance, {
          edit: {
            hdr: obj,
            dlt: _this.dtlTable.data
          }
        }, this, fn)
      }
    },
    cancelClick() {
      getDialog(window.parent.vm.dialogs,'dialog1').visible = !getDialog(window.parent.vm.dialogs,'dialog1').visible
    },
    maintainClick() {
      let _this = this.$refs.editView
      if (_this.$refs.hdrForm.validateForm()) {
        // if(_this.dtlTable.data.some(p=>p.storeDltId.length<=0)) {
        //   console.log('有空仓位');
        //   Vue.prototype.$notify.warning({
        //     title: '进仓明细仓位不能为空',
        //     // title: '警告',
        //     // message: '进仓明细仓位不能为空',
        //   })
        if(_this.dtlTable.data.some(p=>p.qty<=0)) {
          Vue.prototype.$notify.warning({
            title: '进仓明细数据存在问题',
            // title: '警告',
            // message: '进仓明细仓位不能为空',
          })
        } else {
          // console.log('仓位已全部填写完毕');
          this.maintainData()
        }
      } else return
    },
    inputBtnEvent() {
      window.parent.vm.dialogs[1].title = `选择进仓申请单`
      if(this.currentInStoreKind == '采购到货进仓'){
        window.parent.vm.dialogs[1].src = `../PurchaseArrivalHdr/index.html#${token}##beingSelectedPage`
        getDialog(window.parent.vm.dialogs,'dialog2').visible = !getDialog(window.parent.vm.dialogs,'dialog2').visible
      } else if(this.currentInStoreKind == '成品进仓'){
        // window.parent.vm.dialogs[1].src = `../PurchaseArrivalHdr/index.html#${token}#`
        getDialog(window.parent.vm.dialogs,'dialog2').visible = !getDialog(window.parent.vm.dialogs,'dialog2').visible
      } else {
        Vue.prototype.$message({
          type: 'warning',
          message: '请先选择进仓类型',
          duration: 3000
        })
      }
    },
    updateHdrForm(obj, arg, label) {
      let _this = this.$refs.editView
      // 触发进仓类型改变
      if (label == '进仓类型') {
        this.currentInStoreKind = arg
        _this.dtlTable.data = []
        _this.hdrFormItems.form.find(p => p.label == '进仓申请单').options = []
        _this.hdrFormItems.form.find(p => p.label == '进仓申请单').value = ''
      }
      // if(label == '仓库'){
      //   _this.dtlFormItems.form.find(p=>p.label == '仓位').loading = true
      //   newAxios.post(`/store/dlt/queryList`,{condition:{
      //     current:1,
      //     offset:100000,
      //     dlt:[{
      //       key: 'whid',
      //       type: 'like',
      //       value: arg
      //     }]
      //   }})
      //     .then(res=>{
      //       console.log(res.data.records);
      //       _this.dtlFormItems.form.find(p=>p.label == '仓位').options = res.data.records.map(p=>({label:p.shortCode,value:p.id}))
      //     })
      //     .finally(()=> _this.dtlFormItems.form.find(p=>p.label == '仓位').loading = false)
      // }
    },
    updateDtlForm(arg){
      this.currentDtlForm = arg
    },
    confirmBtn(){
      let _this = this.$refs.editView
      _this.dtlTable.data.find(p => {
        if (p.code == this.currentDtlForm.code) {
          for (item in this.currentDtlForm) p[item] = this.currentDtlForm[item]
        }
      })
    },
    rowClick(arg){
      let _this = this.$refs.editView
      // _this.dtlFormItems.form.find(p => p.label == '编号').value = arg.code
      // _this.dtlFormItems.form.find(p => p.label == '仓位').value = arg.storeDltId
    },
  }
})
