// function postSelection(args, source) {
//   console.log(3, 'postSelection')
//   source.postMessage({
//     method: 'passSelection',
//     args: {
//       data: vm.productInfoData,
//       to: args.to
//     }
//   }, '*')
// }

function alertData(args) {
  console.log('alertData', args);
  vm.hdrPartOneForm.purchaseOrderNo = args.data[0].formno
  axiosDict['purchase'].get(`/BillPurOrder/GetDtlList?formno=${args.data[0].formno}&condition=[]`)
    .then(res => {
      console.log('选取采购订单', res);
      // vm.materialData = res.filter(p => p.leave !== 0)
      // vm.showMaterialDialog = true
      return res.filter(p => p.leave !== 0)
    })
    .then(materialData => {
      materialData.forEach(p => {
        axiosDict[apiName].get(`StockAttribute?id=${p.code}`)
          .then(stockData => {
            if(stockData) p.description = stockData.description
          })
      })
      let interval = setInterval(() => {
        if (window.winObj.requestCounter === 0) {
          vm.materialData = materialData
          vm.showMaterialDialog = true
          return clearInterval(interval)
        }
      }, 100)
    })
}
var apiName = 'warehouse'
window.vm = new Vue({
  el: '#root',
  data: {
    footerBtnSize: 'medium',
    loading: false,
    hdrTitle: '到货基本信息',
    dltTitle: '到货明细',
    purchaseOrderNoBtnDisabled: false,
    hdrFormItems: {},
    cellRow: {
      height: '30px',
      padding: "3px 0"
    },
    formLabelWidth: '100px',
    // 表格
    data: [],
    columns: [],
    currentRowClick: {},
    currentDltForm: {},
    // 物料选取
    showMaterialDialog: false,
    currentSelectedMaterial: [],
    materialData: [],
    materialColumns: [],
    quickCoolFormItems: {},
    status: undefined,
    hdrPartOneForm: {
      purchaseOrderNo: '',
      formno: ''
    },
    hdrPartTwoForm: {},
    hdrItemTemplate: {},
    // dtlItemTemplate: {},
    currentSelectedDetail: [],
    // 快速编辑框
    quickDialogVisible: false,
    dialogWidth: '400px',
    labelWidth: '100px',
    currentEditData: {},
    // quickCoolFormItems: {}
  },
  computed: {
    computedHdrForm() {
      let obj = JSON.parse(JSON.stringify(this.hdrPartTwoForm))
      obj = Object.assign(obj,this.hdrPartOneForm)
      return obj
    }
  },
  watch:{
    data(val) {
      window.parent.vm.dialogs[0].saveBtnDisabled = val.length == 0
    },
    // currentRowClick(arg){
    //   this.dltFormItems.additionButtons.buttons[0].disabled = arg == null
    // },
  },
  created() {
    for (let i in window.coolLocals) {
      for (let p in JSON.parse(window.coolLocals[i])) {
        this[p] = JSON.parse(window.coolLocals[i])[p]
      }
    }
    this.columns.forEach(p => {
      if(p.prop == 'qty' || p. prop == 'price' || p. prop == 'num1' || p. prop == 'num2' || p. prop == 'num3') p.formatter = numberToFixedFormatter
    })
    this.materialColumns.forEach(p => {
      if(p.prop == 'price' || p.prop == 'amount') p.formatter = numberToFixedFormatter
    })
  },
  mounted() {
    window.parent.vm.dialogs[0].saveBtnDisabled = true
    setInterval(() => {
      this.purchaseOrderNoBtnDisabled = this.data.length > 0
    })

    this.status = window.location.hash.split('#')[2]
    // procurementAxios.get(`/BillPurOrder/GetHdrPageList?condition=[]&page=1&size=10`)
    // procurementAxios.get(`/BillPurOrder/GetList?condition=[{"FieldName":"Tag","TableName":"[Dtl]","Value":[{"value":false}],"TableRelationMode":"AND","Mode":"为空","DataType":"boolean"}]`)
    //   .then(res => {
    //     this.hdrFormItems.form.find(p => p.label == '采购订单号').options = res.map(p => ({
    //       value: p.formno
    //     }))
    //   })
    // this.getDtlNewItem()

    axiosDict['basic'].get(`Employee/GetList?condition=[]`)
      .then(res=>{
        this.hdrFormItems.form.find(p => p.label == '收货人').options = res.filter(p=>p.departmentName=='仓储部').map(p => ({value:p.id,label:p.name}))

        if(this.status == 'new'){
          axiosDict['basic'].get('Employee/GetCurrent').then(data => {
              let value = this.hdrFormItems.form.find(p => p.label == '收货人').options.find(o => o.label == data.employee) == undefined ? '' : this.hdrFormItems.form.find(p => p.label == '收货人').options.find(o => o.label == data.employee).value
              this.hdrFormItems.form.find(p => p.label == '收货人').value = value
          })
        }
      })

    axiosDict[apiName].get(`Warehouse/GetList?condition=[]`)
    .then(res => {
      console.log('仓库查询',res);
      this.hdrFormItems.form.find(p=>p.label=='选择仓库').options = res.map(p => ({
        value: p.id,
        label: p.name
      }))
    })

    if (this.status == 'new') {
      this.getHdrNewItem()
      let newDate = new Date()
      this.hdrFormItems.form.find(p => p.label == '到货时间').value = newDate
    }
    if (this.status == 'edit' || this.status == 'check') {
      this.loading = true
      this.hdrFormItems.form.forEach(p => {
        if (p.label == '选择仓库' || p.label == "收货人") p.disabled = this.status == 'check'
        else p.readonly = this.status == 'check'
      })
      let arr = []
      axiosDict[apiName].get(`PurchaseArrival/GetBill?formno=${window.location.hash.split('#')[3]}`)
        .then(res => {
          console.log('PurchaseArrival/GetBill', res);
          this.hdrItemTemplate = res.hdr
          for(i in this.hdrPartOneForm){
            this.hdrPartOneForm[i] = res.hdr[i]
          }
          this.hdrFormItems.form.forEach(p => {
            p.value = res.hdr[p.name]
          })
          axiosDict['purchase'].get(`BillPurOrder/GetDtlList?formno=${this.hdrPartOneForm.purchaseOrderNo}&condition=[]`)
            .then(res => {
              this.materialData = res
            })
          for (item in this.hdrPartOneForm) {
            this.hdrPartOneForm[item] = res.hdr[item]
          }
          for (item in this.hdrPartTwoForm) {
            this.hdrPartTwoForm[item] = res.hdr[item]
          }
          // this.data = JSON.parse(JSON.stringify(res.dtls))
          res.dtls.forEach(p => {
            arr.push(p)
          })
          return res.hdr.purchaseOrderNo
        })
        .then(res => {
          axiosDict['purchase'].get(`/BillPurOrder/GetDtlList?formno=${res}&condition=[]`)
            .then(res => {
              res.forEach(p => {
                arr.find(i => {
                  if (i.code == p.code) {
                    i.num1 = p.qty
                    i.num2 = p.qty - p.leave
                    i.num3 = p.leave
                  }
                })
              })
              this.data = arr
            })
        })
        .finally(() => this.loading = false)
    }
  },
  methods: {
    inputBtnEvent() {
      window.parent.vm.dialogs[1].title = `采购订单`
      window.parent.vm.dialogs[1].src = `${serveDict['purchaseURL']}BillPurOrderHdr/index.html#${token}#Arrival`
      getDialog(window.parent.vm.dialogs,'dialog2').visible = !getDialog(window.parent.vm.dialogs,'dialog2').visible
    },
    getHdrNewItem() {
      axiosDict[apiName].get('PurchaseArrival/NewHdr')
        .then(res => {
          if (res) this.hdrItemTemplate = res
        })
    },
    getDtlNewItem() {
      axiosDict[apiName].get('PurchaseArrival/NewDtl')
        .then(res => {
          // if (res) this.dtlItemTemplate = res
        })
    },
    handleMathRound(number,precision) {
      return Math.round(+number + 'e' + precision) / Math.pow(10,precision)
    },
    confirmMaterial() {
      let newData = this.currentSelectedMaterial.filter(p => !this.data.map(d => d.parentSn).includes(p.sn)).map(item => {
        return {
          kind: '物料',
          code: item.code,
          name: item.name,
          specifications: item.specifications,
          qty: item.leave,
          price: item.price,
          leave: item.leave,
          num1: item.qty,
          num2: item.qty - item.leave,
          num3: item.leave,
          description: item.description,
          parentSn: item.sn,
          unit: item.unit
        }
      })
      newData.forEach(p => {
        let item = {}
        axiosDict[apiName].get('PurchaseArrival/NewDtl')
          .then(res => {
            item = Object.assign(JSON.parse(JSON.stringify(res)), p)
            this.data.push(item)
          })
      })
      let interval = setInterval(() => {
        if (window.winObj.requestCounter === 0) {
          this.showMaterialDialog = false
          console.log('asdfasfffffff', this.data);
          return clearInterval(interval)
        }
      }, 100)
    },
    updateHdrForm(obj, arg, label) {
      console.log('updateHdrForm', obj);
      this.hdrPartTwoForm = obj
      // if(label == '采购订单号') {
      //   procurementAxios.get(`/BillPurOrder/GetDtlList?formno=${arg}&condition=[]`)
      //     .then(res=>{
      //       console.log(res);
      //       this.materialData = res
      //     })
      // }
    },
    materialSelection(arg) {
      this.currentSelectedMaterial = arg
    },
    materialRowClick(arg) {
      this.$refs.materialTable.$refs.table.toggleRowSelection(arg)
    },
    detailSelection(arg) {
      this.currentSelectedDetail = arg
    },
    addMaterialBtn() {
      this.showMaterialDialog = true
    },
    removeMaterialBtn() {
      this.currentSelectedDetail.forEach(p => {
        this.data.splice(this.data.indexOf(p), 1)
      })
      this.$refs.materialTable.clearSelectionOuter()
    },
    // cancelBtn() {
    //   getDialog(window.parent.vm.dialogs,'dialog1').visible = !getDialog(window.parent.vm.dialogs,'dialog1').visible
    // },
    maintainClick() {
      console.log('maintainClick', this.computedHdrForm);
      if(!this.$refs.hdrFormItems.validateForm()) return
      this.computedHdrForm.arrivalTime = this.computedHdrForm.arrivalTime.length == 0 ? null : this.computedHdrForm.arrivalTime

      let dtlsData = JSON.parse(JSON.stringify(this.data))
      dtlsData.forEach(p=> {delete p.localTotalPrice})
      axiosDict[apiName].post(`PurchaseArrival/SaveBill`, {
          hdr: Object.assign(this.hdrItemTemplate, this.computedHdrForm),
          dtls: dtlsData
        })
        .then(res => {
          window.parent.vm.$refs.masterView.query()
          getDialog(window.parent.vm.dialogs,'dialog1').visible = !getDialog(window.parent.vm.dialogs,'dialog1').visible
        })
    },
    // updateDltForm(arg) {
    //   this.currentDltForm = arg
    //   console.log(arg);
    // },
    // submit(args){
    //     console.log(args.currentTarget.textContent.trim())
    //     switch (args.currentTarget.textContent.trim()){
    //       case '确定':
    //       {
    //             this.confirmBtn()
    //             break
    //       }
    //     }
    //   },
    // confirmBtn() {
    //   let formItems = {}
    //   this.dltFormItems.form.forEach(p=>{
    //     formItems[p.name] = p.value
    //   })
    //   this.data.find(p => {
    //     if (p == this.currentRowClick) {
    //       for (item in formItems) {
    //         if(item == 'localTotalPrice' && formItems.localTotalPrice!==0) {
    //           p.price = this.handleMathRound(formItems.localTotalPrice/p.qty,2)
    //           p.leave = formItems.qty
    //         } else if (item == 'localTotalPrice' && formItems.localTotalPrice==0){
    //           p.leave = formItems.qty
    //         } else {
    //           p[item] = formItems[item]
    //         }
    //         // item == 'qty' ? p.leave = p[item] = formItems[item] : p[item] = formItems[item]
    //       }
    //     }
    //   })
    //   // this.$refs.dataTable.$refs.table.setCurrentRow()
    //   // this.currentRowClick = null
    // },
    rowClick(arg) {
      console.log(arg);
      this.currentRowClick = arg
      // this.dltFormItems.form.find(p => p.label == '到货明细编号').value = arg.code
      // this.dltFormItems.form.find(p => p.label == '本次到货数量').value = arg.qty
      // this.dltFormItems.form.find(p => p.label == '到货总价').value = 0
      // this.dltFormItems.form.find(p => p.label == '备注').value = arg.description
    },
    dialogClose() {
      this.$refs.materialTable.clearSelectionOuter()
    },
    rowDblClick(arg) {
      console.log(arg)
      this.quickEditEvent(arg)
    },
    quickEditEvent(arg) {
      this.currentEditData = arg
      this.quickDialogVisible = true
      this.data.forEach(p => {
        p.localTotalPrice = 0
      })
      this.quickCoolFormItems.form.forEach(item => {
        for (let i in arg) {
          if (i == item.name) item.value = arg[i]
        }
      })
      this.$refs.dataTable.clearCurrentRow()
    },
    editMaterialBtn() {
      this.quickEditEvent(this.currentSelectedDetail[0])
    },
    quickSaveEvent() {
      this.data.forEach(p => {
        if(p.localTotalPrice!==0) {
          p.price = this.handleMathRound(p.localTotalPrice/p.qty,2)
          p.leave = JSON.parse(JSON.stringify(p.qty))
        } else if (p.localTotalPrice==0) {
          p.leave = JSON.parse(JSON.stringify(p.qty))
        }
      })
    },
    // summaryMethod(param) {
    //   const {
    //     columns,
    //     data
    //   } = param;
    //   const sums = [];
    //   columns.forEach((column, index) => {
    //     if (index === 0) {
    //       sums[index] = '合计';
    //       return;
    //     }
    //     if (column.property != 'amount') {
    //       sums[index] = '';
    //       return;
    //     }
    //     const values = data.map(item => Number(item[column.property]));
    //     if (!values.every(value => isNaN(value))) {
    //       sums[index] = values.reduce((prev, curr) => {
    //         const value = Number(curr);
    //         if (!isNaN(value)) {
    //           return prev + curr;
    //         } else {
    //           return prev;
    //         }
    //       }, 0);
    //       sums[index] += '元';
    //     } else {
    //       sums[index] = '';
    //     }
    //   });
    //   return sums;
    // },
  }
})
