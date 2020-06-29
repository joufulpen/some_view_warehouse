var apiName = JSON.parse(window.coolLocals['index.json'])['apiName']
window.vm = new Vue({
  el: '#root',
  data: {
    // 获取盘点明细列表
    // urlGetEditData: apiDict[apiName] + '/inventory/dlt/queryList',
    // 获取编辑明细
    // urlGetEditDltData: apiDict[apiName] + '/inventory/dlt/queryDetail',
    // 保存盘点信息
    urlSaveEditDate: 'Inventory/EnterNum',
    waiting: false,
    rawData: [],
    pagination: {
      page: 1,
      pageSize: 10
    },
    productColumns: [{
        prop: 'index',
        label: '序号',
        fixed: 'fixed',
        width: '50px'
      },
      // {
      //   prop: "formno",
      //   label: "盘点表编号",
      //   width: '160',
      //   fixed: 'fixed',
      // }
    ],
    productColumns1: [{
      prop: "checkNum",
      label: "盘点数量",
      width: "150"
    }],
    productColumns2: [
    //   {
    //   prop: "qty",
    //   label: "存放数量"
    // },
    //  {
    //   prop: "whid",
    //   label: "存放仓库"
    // },
    {
      prop: "code",
      label: "编码",
      width: "130px"
    }, {
      prop: "storeDltId",
      label: "仓位"
    }, {
      prop: "name",
      label: "名称"
    }, {
      prop: "specifications",
      label: "规格"
    }, {
      prop: "pigment",
      label: "颜色"
    }, {
      prop: "description",
      label: "备注"
    }],
    // 查询条件
    originCondition: [],
    condition: [],
    buttons: [],
    // 分页
    total: 0,
    currentEditId: undefined,
    // 查询响应内容
    // dltQuery: [],
    layout: 'total, sizes, prev, pager, next, jumper',
    modeList: {}
  },
  created() {
    for (let i in window.coolLocals) {
      for (let p in JSON.parse(window.coolLocals[i])) {
        this[p] = JSON.parse(window.coolLocals[i])[p]
      }
    }
    for(let item in this.originCondition) {
      this.originCondition[item].modeList = this.modeList[this.originCondition[item].dataType]
    }
  },
  mounted() {
    // this.getWarehouseData()
    this.$el.style.visibility = 'visible'
    let str = window.location.hash
    this.currentEditId = str.split(/[#?]/)[2]
    this.getEditData()
  },
  methods: {
    //获取传出的查询参数
    getCondition(arg) {
      console.log('getCondition',arg);
      this.condition = arg
      // arg.forEach(p => {
      //   p.type = 'like'
      // })
      // this.dltQuery = arg
      // console.log(this.dltQuery)
    },
    // 获取仓库选项
    getWarehouseData() {
      axiosDict[apiName].get(`Warehouse/GetList?condition=[]`)
      .then(res => {
        console.log('仓库查询',res);
        this.originCondition.whid.options = res.map(p => ({
          value: p.id,
          label: p.name
        }))
      })
    },
    // 获取编辑信息
    getEditData() {

      // this.waiting = true
      // this.dltQuery = []
      // this.dltQuery.splice(0, this.dltQuery.length)
      // this.dltQuery.push({
      //   key: 'formno',
      //   value: this.currentEditId
      // })
      axiosDict[apiName].get(`Inventory/GetDtlPageList?condition=${JSON.stringify(this.condition)}&page=${this.pagination.page}&size=${this.pagination.pageSize}&formno=${this.currentEditId}`)
        .then(res => {
          res.rows.forEach(p=>{
            p.checkNum = p.checkNum == null ? undefined : p.checkNum
          })
          formatIndex(res.rows,this.pagination.page,this.pagination.pageSize)
          this.rawData = res.rows
          this.total = res.total
        })


      // let params = {
      //   condition: {
      //     current: this.pagination.page,
      //     offset: this.pagination.pageSize,
      //     dlt: this.dltQuery
      //   }
      // }
      //
      // let fn = res => {
      //   res.data.records.forEach(p=>{
      //     p.checkNum = p.checkNum == null ? undefined : p.checkNum
      //   })
      //   formatIndex(res.data.records,this.pagination.page,this.pagination.pageSize)
      //   this.rawData = res.data.records
      //   this.total = res.data.total
      // }
      //
      // coolAxios(this.urlGetEditData, params, this, fn)
    },
    // 敲回车跳到下一个输入框
    focusNextInput(thisInput) {
      var inputs = document.getElementsByClassName("onlyInput");
      for (var i = 0; i < inputs.length; i++) {
        // 如果是最后一个，则焦点回到第一个
        if (i == (inputs.length - 1)) {
          inputs[0].children[0].focus();
          // console.log(inputs[0])
          break;
        } else if (thisInput.currentTarget == inputs[i]) {
          inputs[i + 1].children[0].focus();
          break;
        }
      }
    },
    // 保存编辑信息
    saveEditData() {
      let data = JSON.parse(JSON.stringify(this.rawData))
      data.map(p=>{
        p.checkNum = p.checkNum == undefined ? null : p.checkNum
      })
      axiosDict[apiName].post(this.urlSaveEditDate,{
        dtls: data
      }).then(res => {
        this.getEditData()
      })

      // let obj = {
      //   msg: true,
      //   fn: res => {
      //     this.getEditData()
      //   }
      // }
      // let data = JSON.parse(JSON.stringify(this.rawData))
      // data.map(p=>{
      //   p.checkNum = p.checkNum == undefined ? null : p.checkNum
      // })
      // coolAxios(this.urlSaveEditDate, {
      //   edit: {
      //     dlt: data
      //   }
      // }, this, obj)
    },

    // 删除进仓单
    delTab() {
      this.items.forEach(p => {
        this.rawData.splice(this.rawData.indexOf(p), 1)
      })
    },

    paginationSizeChange(arg) {
      console.log(arg)
      this.pagination.page = 1
      this.pagination.pageSize = arg
      this.getEditData()
    },
    paginationCurrentChange(arg) {
      this.pagination.page = arg
      this.getEditData()
    },
    // 取消按钮
    // cancelClick() {
    //   window.parent.vm.getDialog('dialog2').visible = !window.parent.vm.getDialog('dialog2').visible
    // },
    // 按钮点击事件
    buttonsevent: function(args) {
      switch (args.currentTarget.textContent.trim()) {
        case '查询':
          {
            this.getEditData()
            break
          }
        default:
          console.log("！未知错误！")
          break
      }
    },
  }
})
