window.vm = new Vue({
  el: '#root',
  data: {
    // 获取编辑信息
    urlGetEditData: apiObject.warehouseURL + '/adjustOut/dlt/queryList',
    // 保存新建信息
    urlConfirmData: apiObject.warehouseURL + '/adjustOut/hdr/save',
    // 保存编辑信息
    urlSaveEditDate: apiObject.warehouseURL + '/adjustOut/hdr/edit',
    //获取主表数据详情
    urlGetDetail: apiObject.warehouseURL + '/adjustOut/hdr/queryDetail',
    //获取仓库选项
    urlGetWarehouseData: apiObject.warehouseURL + '/store/hdr/queryList',
    //获取出库类型
    urlGetOutType: apiObject.warehouseURL + '/adjustOut/type',
    // edit dialog
    editDialogTitle: '编辑出仓单',
    formItems: {
      form: [{
        type: 'input',
        value: '',
        label: '物料编码',
        name: 'code',
        disabled: true
      }, {
        name: "name",
        label: "物料名称",
        type: 'input',
        value: '',
        disabled: true
      }, {
        name: "productName",
        label: "规格",
        type: 'input',
        value: '',
        disabled: true
      }, {
        name: "qty",
        label: "数量",
        type: 'input',
        value: '',
        disabled: false
      }, {
        name: "",
        label: "主材质",
        type: 'input',
        value: '',
        disabled: true
      }, {
        name: "description",
        label: "备注",
        type: 'input',
        value: '',
        disabled: true
      }, {
        name: "color1",
        label: "花色",
        type: 'input',
        value: '',
        disabled: true
      }, {
        name: "",
        label: "转出仓位",
        type: 'input',
        value: '',
        disabled: true
      }, {
        name: "",
        label: "转入仓位",
        type: 'input',
        value: '',
        disabled: true
      }, {
        name: "",
        label: "库存单位",
        type: 'input',
        value: '',
        disabled: true
      }, {
        name: "",
        label: "批次",
        type: 'input',
        value: '',
        disabled: true
      }]
    },
    width: '650px',
    // new edit views
    hdrTitle: '调出单基础信息',
    dltTitle: '调出单明细',
    labelWidth: '100px',
    newEditTableData: {
      data: [],
      tableButtons: [
        // {
        //   text: '选择成品',
        //   size: 'mini',
        //   icon: 'el-icon-search',
        //   disabled: false
        // }, {
        //   text: '选择半成品',
        //   size: 'mini',
        //   icon: 'el-icon-search',
        //   disabled: false
        // }, {
        //   text: '选择原材料',
        //   size: 'mini',
        //   icon: 'el-icon-search',
        //   disabled: false
        // },
        {
          text: '编辑',
          size: 'mini',
          icon: 'el-icon-edit',
          disabled: true
        },
        {
          text: '删除',
          size: 'mini',
          icon: 'el-icon-delete',
          disabled: true
        }
      ],
      columns: [{
          type: 'selection'
        }, {
          prop: 'index',
          label: '序号',
          fixed: 'fixed',
          type: 'index',
          width: '50px'
        }, {
          prop: 'code',
          label: '编码'
        }, {
          prop: '',
          label: '转出仓库'
        }, {
          prop: '',
          label: '转入仓库'
        }, {
          prop: 'qty',
          label: '数量'
        }
        // {
        //   prop: "code",
        //   label: "物料编码",
        //   width: '160',
        //   fixed: 'fixed',
        //   value: ''
        // }, {
        //   prop: "name",
        //   label: "物料名称",
        //   value: ''
        // }, {
        //   prop: "productName",
        //   label: "规格",
        //   value: ''
        // }, {
        //   prop: "qty",
        //   label: "数量",
        //   value: ''
        // }, {
        //   prop: "",
        //   label: "主材质",
        //   value: ''
        // }, {
        //   prop: "color1",
        //   label: "花色",
        //   value: ''
        // }, {
        //   prop: "",
        //   label: "转出仓位",
        //   value: ''
        // }, {
        //   prop: "",
        //   label: "转入仓位",
        //   value: ''
        // }, {
        //   prop: "",
        //   label: "库存单位",
        //   value: ''
        // }, {
        //   prop: "",
        //   label: "批次",
        //   value: ''
        // }, {
        //   prop: "description",
        //   label: "备注",
        //   value: ''
        // }
      ],
    },

    waiting: false,
    currentIndex: null,
    productData1: [],
    currentRow: undefined,
    currentformNo: undefined,
    formNoArray: [],
    rawData: [],
    ids: [],
    selected: [],
    datevalue: '',
    description: '',
    cellRow: {
      height: '30px',
      padding: '5px 0'
    },
    //编辑对话框数据
    dialogVisible: false,
    formLabelWidth: '100px',
    form: {},
    currentLeave: null, //当前可编辑的数量
    currentLeaveId: null, //可编辑的数量对应的id
    callOutForm: {
      form: [{
          type: 'input',
          value: '',
          label: '调拨单号',
          name: 'formNo',
          disabled: true
        },
        {
          type: 'date',
          value: '',
          label: '调拨日期',
          name: 'operationDate',
          inputStyle: {
            width: '178px'
          },
          rules: {
            required: true,
            message: '调拨日期不能为空',
            trigger: 'blur'
          }
        }, {
          type: 'select',
          value: '',
          label: '出库类型',
          name: 'type',
          inputStyle: {
            width: '178px'
          },
          options: [],
          rules: {
            required: true,
            message: '出库类型不能为空',
            trigger: 'blur'
          }
        },
        // {
        //   type: 'select',
        //   value: '',
        //   label: '入库类型',
        //   name: 'settlementType',
        //   options: [],
        //   inputStyle: {
        //     width: '178px'
        //   }
        // },
        {
          type: 'select',
          value: '',
          label: '转出仓库',
          name: 'outStoreId',
          options: [],
          inputStyle: {
            width: '178px'
          },
          rules: {
            required: true,
            message: '转出仓库不能为空',
            trigger: 'blur'
          }
        },
        // {
        //   type: 'select',
        //   value: '',
        //   label: '转入仓库',
        //   name: 'inStoreId',
        //   options: [],
        //   inputStyle: {
        //     width: '178px'
        //   }
        // },
        {
          type: 'input',
          value: '',
          label: '备注',
          name: 'description'
        },
      ]
    },
    // 分页
    total: 0,
    currentId: undefined,
    currentNo: undefined,
    condition: {
      hdr: {},
      dlt: []
    },
    dltData: {
      dlt: []
    },
    editHdr: {},
    layout: 'total, sizes, prev, pager, next, jumper',
  },

  mounted() {
    this.$el.style.visibility = 'visible'
    // let str = window.location.hash
    // this.currentId = str.split(/[#?]/)[2]
    this.currentId = id
    console.log(this.currentId);
    if (this.currentId != undefined) {
      this.getQueryDetail()
    }
    // this.getAllData()
    this.getWarehouseData()
    this.getOutType()
  },
  methods: {
    // 当数据编辑到最后一条 弹出提示框
    comfirmEditData() {
      this.$confirm('数据已经编辑到最后一条了, 是否保存退出?-', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.saveData()
        this.$message({
          type: 'success',
          message: '保存成功!',
          duration: 1000
        });
      }).catch(() => {
        this.currentIndex = this.newEditTableData.data.length - 1
        this.$message({
          type: 'info',
          message: '已取消！',
          duration: 1000
        });
      });
    },
    // 按上键回到上一条数据
    backUp() {
      this.currentIndex--
      if (this.currentIndex < 0) {
        this.$message.warning('当前数据为第一条数据')
        this.currentIndex = 0
        console.log(this.currentIndex)
      } else {
        this.changeInputData()
      }
    },
    // 按下键、回车切换到下一条数据
    backDown() {
      this.currentIndex++
      if (this.currentIndex >= this.newEditTableData.data.length) {
        // this.$message.warning('数据已经编辑到最后一条了')
        // this.currentIndex = this.newEditTableData.data.length - 1
        if (this.currentIndex == this.newEditTableData.data.length) {
          this.comfirmEditData()
        }
        console.log(this.currentIndex, this.newEditTableData.data.length)
      } else {
        this.changeInputData()
      }
    },
    //切换输入框内容的方法
    changeInputData() {
      // this.currentLeave = this.newEditTableData.data[this.currentIndex].qty
      this.formItems.form[3].value = this.newEditTableData.data[this.currentIndex].qty
      this.currentLeaveId = this.newEditTableData.data[this.currentIndex].id
      for (i in this.newEditTableData.data[this.currentIndex]) {
        this.formItems.form.forEach(p => {
          if (p.name == i) {
            p.value = this.newEditTableData.data[this.currentIndex][i]
          }
        })
      }
      // console.log(this.newEditTableData.data,this.currentIndex)
    },
    //敲回车保存当前编辑数据 并切换下一条数据
    nextInputData() {
      this.changeEditData(this.backDown)
    },
    // 编辑弹出窗确定按钮的方法
    saveData() {
      this.changeEditData(this.closeEdit)
    },

    closeEdit() {
      this.dialogVisible = false
    },

    // 编辑弹出窗确定按钮的方法 因两处均有用到 遂简易封装
    changeEditData(callback) {
      let reg = /^[0-9]*$/;
      if (!reg.test(this.formItems.form[3].value) || this.formItems.form[3].value == '') {
        alert('请留个数字再走吧!')
        return false;
      } else {
        // console.log('是数字吧')
        this.newEditTableData.data = this.newEditTableData.data.map((item, index) => {
          if (item.id == this.currentLeaveId) {
            item.leave = this.formItems.form[3].value
            item.qty = item.leave
            return item;
          } else {
            return item;
          }
        })
        callback()
      }
    },
    // 表格双击事件
    rowDblclick(arg) {
      // this.currentLeave =arg.qty
      this.formItems.form[3].value = arg.qty
      this.currentLeaveId = arg.id
      this.newEditTableData.data.map((item, index) => {
        if (arg.id == item.id) {
          this.currentIndex = index
          //取出当前双击行的index
          for (i in item) {
            this.formItems.form.forEach(p => {
              if (p.name == i) {
                p.value = item[i]
              }
            })
          }
        }
      })
      this.testCode = arg.name
      this.dialogVisible = true
      console.log(arg, this.currentLeave, this.currentLeaveId, this.currentIndex)
    },
    // 查询按钮的方法
    // searchData(openUrl, opentitle) {
    //   console.log(openUrl)
    //   window.parent.vm.dialogs[1].src = openUrl
    //   window.parent.vm.dialogs[1].title = opentitle
    //   setTimeout(() => {
    //     getDialog(window.parent.vm.dialogs,'dialog2').visible = !getDialog(window.parent.vm.dialogs,'dialog2').visible
    //   }, 100)
    // },
    getOutType() {
      let fn = res => {
        this.areaName = res.data.records
        this.callOutForm.form[2].options = res.data.records.map(p => {
          var obj = {}
          obj.value = p
          obj.label = p
          return obj
        })
      }
      coolAxios(this.urlGetOutType, {}, this, fn)
    },
    // 获取仓库选项
    getWarehouseData() {
      let fn = res => {
        this.areaName = res.data.records
        this.callOutForm.form[3].options = res.data.records.map(p => {
          var obj = {}
          obj.value = p.id
          obj.label = p.name
          return obj
        })
      }
      coolAxios(this.urlGetWarehouseData, {
        condition: {
          hdr: []
        }
      }, this, fn)
    },
    getQueryDetail() {
      let fn = res => {
        this.editHdr = Object.assign(res.data, this.editHdr)
        this.callOutForm.form[0].value = res.data.formNo
        this.callOutForm.form[1].value = res.data.operationDate
        this.callOutForm.form[2].value = res.data.type
        this.callOutForm.form[3].value = res.data.outStoreId
        this.callOutForm.form[4].value = res.data.description
        this.dltData.dlt.push({
          'key': 'formNo',
          'value': res.data.formNo
        })
        // 获取编辑信息
        coolAxios(this.urlGetEditData, {
          condition: this.dltData
        }, this, {
          takeData: this.newEditTableData.data,
          total: this.newEditTableData.total
        })
      }
      coolAxios(this.urlGetDetail, {
        id: this.currentId
      }, this, fn)
    },
    // 保存编辑信息
    saveEditData() {
      let fn = res => {
        getDialog(window.parent.vm.dialogs,'dialog1').visible = !getDialog(window.parent.vm.dialogs,'dialog1').visible
        window.parent.vm.getAllData()
      }
      this.editHdr.operationDate = dayjs(this.callOutForm.form[1].value).format("YYYY-MM-DD")
      this.editHdr.type = this.callOutForm.form[2].value
      this.editHdr.outStoreId = this.callOutForm.form[3].value
      this.editHdr.description = this.callOutForm.form[4].value
      coolAxios(this.urlSaveEditDate, {
        edit: {
          hdr: this.editHdr,
          dlt: this.newEditTableData.data
        }
      }, this, fn)
    },
    // 保存信息
    confirmData() {
      let fn = res => {
        getDialog(window.parent.vm.dialogs,'dialog1').visible = !getDialog(window.parent.vm.dialogs,'dialog1').visible
        window.parent.vm.getAllData()
      }
      this.condition.hdr.operationDate = dayjs(this.callOutForm.form[1].value).format("YYYY-MM-DD")
      this.condition.hdr.type = this.callOutForm.form[2].value
      this.condition.hdr.outStoreId = this.callOutForm.form[3].value
      this.condition.hdr.description = this.callOutForm.form[4].value
      this.condition.dlt = this.newEditTableData.data
      coolAxios(this.urlConfirmData, {
        save: this.condition
      }, this, fn)
    },
    // 删除进仓单
    delTab() {
      this.items.forEach(p => {
        this.newEditTableData.data.splice(this.newEditTableData.data.indexOf(p), 1)
      })
    },
    // 表格多选操作
    selection(arg) {
      this.newEditTableData.tableButtons[3].disabled = arg.length !== 1
      this.newEditTableData.tableButtons[4].disabled = arg.length === 0
      if (arg.length != 0) {
        this.items = []
        this.formNoArray = []
        this.selected = arg
        this.selected.forEach(p => {
          this.items.push(p)
        })
        for (i in this.selected[0]) {
          this.formItems.form.forEach(p => {
            if (p.name == i) {
              p.value = this.selected[0][i]
            }
          })
        }
        this.currentLeave = this.selected[0].qty
        this.currentLeaveId = this.selected[0].id
        console.log(this.currentLeave, this.currentLeaveId, this.selected[0])
      } else this.selected = []
    },
    paginationSizeChange(arg) {
      this.condition.current = 1
      this.condition.offset = arg
    },
    paginationCurrentChange(arg) {
      this.condition.current = arg
    },
    // 取消按钮
    cancelClick() {
      getDialog(window.parent.vm.dialogs,'dialog1').visible = !getDialog(window.parent.vm.dialogs,'dialog1').visible
    },
    // 保存按钮方法
    keepData() {
      if (this.callOutForm.form[1].value == '' || this.callOutForm.form[2].value == '' || this.callOutForm.form[3].value == '') {
        this.$message.warning('嘿！ 把有红星的框都填完 才能走')
      } else if (this.currentId != undefined) {
        this.saveEditData()
      } else if (this.newEditTableData.data.length == 0) {
        this.$message.warning('数据都没选 你又想干嘛')
      } else this.confirmData()
    },

    // 按钮点击事件
    buttonsevent: function(args) {
      switch (args.currentTarget.textContent) {
        // case '选择成品':
        //   {
        //     if (this.callOutForm.form[3].value == '') {
        //       this.$message.warning('请先选择转出仓库！！')
        //     } else {
        //       this.searchData(`../product.html#${token}#allot#${this.callOutForm.form[3].value}`, '成品库存管理');
        //     }
        //     break
        //   }
        // case '选择半成品':
        //   {
        //     if (this.callOutForm.form[3].value == '') {
        //       this.$message.warning('请先选择转出仓库！！')
        //     } else {
        //       this.searchData(`../semi.html#${token}#allot#${this.callOutForm.form[3].value}`, '半成品库存管理');
        //     }
        //     break
        //   }
        // case '选择原材料':
        //   {
        //     if (this.callOutForm.form[3].value == '') {
        //       this.$message.warning('请先选择转出仓库！！')
        //     } else {
        //       this.searchData(`../raw.html#${token}#allot#${this.callOutForm.form[3].value}`, '原材料库存管理');
        //     }
        //     break
        //   }
        case '编辑':
          {
            this.dialogVisible = true
            console.log('编辑操作');
            break
          }
        case '删除':
          {
            this.delTab()
            break
          }
        default:
          console.log("！未知错误！")
          break
      }
    },
  }
})
