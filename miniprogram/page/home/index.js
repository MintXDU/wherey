// page/home/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showModal: false, // 控制弹窗显示隐藏
    showPicModal: false,
    showDeleteDialog: false,
    showEditModal: false,
    showEditPicModal: false,
    searchKeyword: '', // 搜索关键词
    deletingIndex: -1,
    editingIndex: -1,
    tmpItem: {
      name: '',
      pic:'',
      location: {},     // 存放位置信息
      customLocation: '', // 用户自定义位置描述
      time: '12:00',     // 默认时间
      date: '2025-01-01'  // 默认日期
    },
    editingItem: {
      name: '',
      pic: '',
      location: {},
      customLocation: '', // 用户自定义位置描述
      time: '12:00',
      date: '2025-01-01'
    },
    itemList: [],
    filteredItemList: [] // 过滤后的物品列表
  },
  showPicModal() {
    this.setData({
      showPicModal: true
    })
  },
  takePhoto() {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          'tmpItem.pic': res.tempImagePath
        })
      }
    })
  },
  error(e) {
    console.log(e.detail)
  },
  // 图片预览
  previewImage(e) {
    const src = e.currentTarget.dataset.src; // 获取图片 URL
    wx.previewImage({
      current: src, // 当前显示的图片
      urls: this.data.itemList.map(item => item.pic) // 所有图片的 URL 列表
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 从本地缓存中读取 itemList
    const itemList = wx.getStorageSync('itemList') || [];
    this.setData({
      itemList: itemList,
      filteredItemList: itemList
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 打开弹窗
  openModal: function () {
    const currentTime = this.getCurrentTime();
    this.setData({
      showModal: true,
      'tmpItem.date': currentTime.date,
      'tmpItem.time': currentTime.time
    });
  },

  // 调用微信内置选择位置API
  chooseLocation: function () {
    const that = this;
    wx.chooseLocation({
      success: function (res) {
        // res 中包含地址、经纬度等信息
        that.setData({
          'tmpItem.location': res
        });
      },
      fail: function () {
        wx.showToast({
          title: '选择位置失败',
          icon: 'none'
        });
      }
    });
  },

  // 时间选择器事件
  bindTimeChange: function (e) {
    this.setData({
      'tmpItem.time': e.detail.value
    });
  },

  // 日期选择器事件
  bindDateChange: function (e) {
    this.setData({
      'tmpItem.date': e.detail.value
    });
  },

  // 表单提交事件
  formSubmit: function (e) {
    // 获取表单中所有输入数据
    const formData = e.detail.value;

    // 验证必填字段
    if (!formData.name) {
      wx.showToast({
        title: '请输入物品名称',
        icon: 'none'
      });
      return;
    }

    if (!this.data.tmpItem.location.address) {
      wx.showToast({
        title: '请选择位置',
        icon: 'none'
      });
      return;
    }

    this.setData({
      'tmpItem.name': formData.name,
      'tmpItem.customLocation': formData.customLocation
    });
    
    // 此处可以进行数据校验、提交到后台等处理
    console.log('提交的数据：', this.data.tmpItem);
    this.addToItemList();

    // 提交后关闭弹窗
    this.setData({
      showModal: false
    });
  },

  // 添加 tmpItem 到 itemList
  addToItemList() {
    const { tmpItem, itemList, searchKeyword } = this.data;

    // 将 tmpItem 添加到 itemList
    itemList.push(tmpItem);

    // 更新 itemList 和 filteredItemList
    this.setData({
      itemList: itemList,
      filteredItemList: this.filterItems(itemList, searchKeyword)
    });

    // 清空 tmpItem
    this.setData({
      tmpItem: {
        name: '',
        pic: '',
        location: {},
        customLocation: '', // 清空时也重置自定义位置
        time: '12:00',
        date: '2025-01-01'
      }
    });

    // 存储到本地缓存
    wx.setStorageSync('itemList', itemList);
  },

  // 关闭弹窗
  cancelModal: function(e) {
    // 提交后关闭弹窗
    this.setData({
      showModal: false
    });
  },
  cancelPicModal: function(e) {
    // 提交后关闭弹窗
    this.setData({
      showPicModal: false
    });
  },

  // 打开地图查看位置
  openLocation: function(e) {
    const latitude = e.currentTarget.dataset.latitude;
    const longitude = e.currentTarget.dataset.longitude;
    
    wx.openLocation({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      scale: 18
    });
  },

  // 搜索处理函数
  onSearch: function(e) {
    const keyword = e.detail.value.toLowerCase();
    const filteredList = this.data.itemList.filter(item => 
      item.name.toLowerCase().includes(keyword) ||
      (item.location.address && item.location.address.toLowerCase().includes(keyword)) ||
      (item.customLocation && item.customLocation.toLowerCase().includes(keyword))
    );
    
    this.setData({
      searchKeyword: keyword,
      filteredItemList: filteredList
    });
  },

  // 辅助函数：根据关键词过滤物品
  filterItems(items, keyword) {
    if (!keyword) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(keyword) ||
      (item.location.address && item.location.address.toLowerCase().includes(keyword)) ||
      (item.customLocation && item.customLocation.toLowerCase().includes(keyword))
    );
  },

  // 显示删除确认弹窗
  showDeleteDialog: function(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      showDeleteDialog: true,
      deletingIndex: index
    });
  },

  // 隐藏删除确认弹窗
  hideDeleteDialog: function() {
    this.setData({
      showDeleteDialog: false,
      deletingIndex: -1
    });
  },

  // 删除物品
  deleteItem: function() {
    const { deletingIndex, itemList, searchKeyword } = this.data;
    if (deletingIndex >= 0) {
      itemList.splice(deletingIndex, 1);
      this.setData({
        itemList: itemList,
        filteredItemList: this.filterItems(itemList, searchKeyword),
        showDeleteDialog: false,
        deletingIndex: -1
      });
      wx.setStorageSync('itemList', itemList);
    }
  },

  // 获取当前时间
  getCurrentTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`
    };
  },

  // 编辑物品
  editItem(e) {
    const index = e.currentTarget.dataset.index;
    const currentTime = this.getCurrentTime();
    
    this.setData({
      showEditModal: true,
      editingIndex: index,
      editingItem: {
        ...this.data.itemList[index],
        date: currentTime.date,
        time: currentTime.time
      }
    });
  },

  // 取消编辑
  cancelEditModal: function() {
    this.setData({
      showEditModal: false,
      editingIndex: -1,
      editingItem: {
        name: '',
        pic: '',
        location: {},
        customLocation: '', // 清空时也重置自定义位置
        time: '12:00',
        date: '2025-01-01'
      }
    });
  },

  // 编辑表单提交
  editFormSubmit: function(e) {
    const formData = e.detail.value;
    const { itemList, editingItem, searchKeyword } = this.data;
    
    // 验证必填字段
    if (!formData.name) {
      wx.showToast({
        title: '请输入物品名称',
        icon: 'none'
      });
      return;
    }

    if (!editingItem.location.address) {
      wx.showToast({
        title: '请选择位置',
        icon: 'none'
      });
      return;
    }
    
    // 更新编辑项的数据
    const updatedItem = {
      ...editingItem,
      name: formData.name || editingItem.name,
      customLocation: formData.customLocation || editingItem.customLocation,
      pic: editingItem.pic,
      location: editingItem.location,
      date: editingItem.date,
      time: editingItem.time
    };
    
    // 更新 itemList
    itemList[this.data.editingIndex] = updatedItem;
    
    // 更新数据
    this.setData({
      itemList: itemList,
      filteredItemList: this.filterItems(itemList, searchKeyword),
      showEditModal: false,
      editingIndex: -1
    });
    
    // 存储到本地缓存
    wx.setStorageSync('itemList', itemList);
  },

  // 编辑时选择位置
  chooseEditLocation: function() {
    const that = this;
    wx.chooseLocation({
      success: function(res) {
        that.setData({
          'editingItem.location': res
        });
      },
      fail: function() {
        wx.showToast({
          title: '选择位置失败',
          icon: 'none'
        });
      }
    });
  },

  // 编辑时修改日期
  bindEditDateChange: function(e) {
    this.setData({
      'editingItem.date': e.detail.value
    });
  },

  // 编辑时修改时间
  bindEditTimeChange: function(e) {
    this.setData({
      'editingItem.time': e.detail.value
    });
  },

  // 显示编辑图片弹窗
  showEditPicModal: function() {
    this.setData({
      showEditPicModal: true
    });
  },

  // 取消编辑图片弹窗
  cancelEditPicModal: function() {
    this.setData({
      showEditPicModal: false
    });
  },

  // 重拍
  retakePhoto() {
    this.setData({
      'tmpItem.pic': ''
    })
  },

  // 确认照片
  confirmPhoto() {
    this.setData({
      showPicModal: false
    })
  },

  // 编辑时拍照
  takeEditPhoto() {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          'editingItem.pic': res.tempImagePath
        })
      }
    })
  },

  // 编辑时重拍
  retakeEditPhoto() {
    this.setData({
      'editingItem.pic': ''
    })
  },

  // 编辑时确认照片
  confirmEditPhoto() {
    this.setData({
      showEditPicModal: false
    })
  },
})