//imgPreView.js;
//给予jquery开发;
//作者 何超峰
//如有问题联系作者qq 602527818;
//触发‘图片查看器’的 点击事件
$(function(){
    $('.img-view').click(function(e){
        var _myUrls_c=_myCurrentUrl_c=[];
        var imgs=$(e.target).parent().find('.img-view')
        for(var i=0;i<imgs.length;i++){
            var _src=imgs.eq(i).attr('src');
            _myUrls_c.push(_src)
        };
       _myCurrentUrl_c=$(e.target).attr('src');
        var banner1=new YY.banner({_urls:_myUrls_c,_current:_myCurrentUrl_c});
        e.preventDefault();
        e.stopPropagation();
    });

    var YY={};
    YY.touchEvents = {
            touchstart: "tapstart",
            touchmove: "touchmove",
            touchend: "touchend"
        };
    YY.banner=function(paramters){
    	var paramters=paramters||{};
    	var _urls=paramters._urls||[];
    	var _current=paramters._current||[];
    	var  initcolor="#666",currentcolor="#fff";
        var _index=function(){
            for(var i=0;i<_urls.length;i++){
                if(_urls[i]==_current){
                    return i;
                };
            }
        };
        //css
        var _css="<style>div::-webkit-scrollbar{display:none;}\
                    #imgContainer:after{\
                        content:' ';\
                        display:inline-block;\
                        height:100%;\
                        width:0px;\
                        background: red;\
                        vertical-align: middle;\
                    }</style>"
        $('head').append(_css);

        var _width=document.documentElement.clientWidth;
        var _height=document.documentElement.clientHeight;
        //轮播图的亮点 _pragations 
        var _pragations_start="<p id='pragations' style='position:fixed;bottom:20px;display:block;width:100%;text-align:center;z-index:1000'>\
        				<a id='myPoints'>";
        var _pragations_end="</a></p>";
        // imgViewPort
        var _container_start="<div id=\"imgViewPort\" style='overflow:hidden;background: #000;opacity:1;position:fixed;left:0;top:0;width:"+_width+"px'>\
            <div id=\"imgContainer\"  style='overflow:hidden;width:300%;height:100%; vertical-align: middle;line-height:100%;'>";
        var _container_end="</div></div>"
        var _container_imgs='';
        var _pragations_content='';
        for(var i =0 ;i<_urls.length;i++){
        	_container_imgs+='<img src="'+_urls[i]+'" alt="" style="width:'+_width+'px;vertical-align:middle;cursor:pointer;">';
        	_pragations_content+="<span style='display:inline-block;height:6px;width:6px;border-radius:50%;background:#ccc;margin-left:3px;'></span>"
        	
        };
        var _view=_container_start+_container_imgs+_container_end;
        var _pragations=_pragations_start+_pragations_content+_pragations_end;
        //_pragations
        $('body').append(_pragations);
        //_view
        $('body').append(_view).css({height:"100%","overflow":"hidden"});
        $('#imgViewPort').css({height:_height})
        $('html').css({'min-height':'100%','width':'100%'});

    YY.ScrollImg=function (box,config){
        this.box = $(box);
        this.config = $.extend({},config||{});
        this.width = this.config.width||this.box.children().eq(0).width();//一次滚动的宽度
        this.size = this.config.size||this.box.children().length;
        this.loop = this.config.loop||false;//默认能循环滚动
        this.auto = this.config.auto||false;//默认自动滚动
        this.auto_wait_time = this.config.auto_wait_time||3000;//轮播间隔
        this.scroll_time = 300;//滚动时长
        this.minleft = -this.width*(this.size-1);//最小left值，注意是负数[不循环情况下的值]
        this.maxleft =0;//最大lfet值[不循环情况下的值]
        this.now_left = 0;//初始位置信息[不循环情况下的值]
        this.now_top = 0;//初始位置信息[不循环情况下的值]
        this.point_x = null;//记录一个x坐标
        this.point_y = null;//记录一个y坐标
        this.move_left = false;//记录向哪边滑动
        this.index = 0;
        this.busy = false;
        this.timer;
        this.initPage=0;
        this.init();
    };
    $.extend(YY.ScrollImg.prototype,{
        init : function(){
        	 $('#myPoints span').css("background",initcolor).eq(this.initPage).css("background",currentcolor)
            this.bind_event();
            //初始化跳到当前的要显示的图片
            var ind=_index();
            this.go_index(ind,"init")
            $('#myPoints span').css("background",initcolor).eq(ind).css("background",currentcolor)
            this.init_loop();
            this.auto_scroll();

        },
        bind_event : function(){
            var self = this;
            var o_x=0;
            var o_y=0; 
            var imgViewPort= $('#imgViewPort')[0];
            //touchstart事件
            imgViewPort.addEventListener(YY.touchEvents.touchstart,function(e){
                if(e.target.nodeName=="IMG"  && !self.busy){
                    o_x=self.point_x = e.touches[0].clientX;
                    o_y=self.point_y = e.touches[0].clientY;
                }
            },false);
            //touchmove事件
             imgViewPort.addEventListener(YY.touchEvents.touchmove,function(e){
                e.preventDefault(); 
                if(e.target.nodeName=="IMG" && !self.busy){
                    return self.move(e.touches[0].clientX,e.touches[0].clientY);//这里根据返回值觉得是否阻止默认touch事件
                }
            },false);
             //touchend事件
            imgViewPort.addEventListener(YY.touchEvents.touchend,function(e){
                !self.busy && self.move_end();
            },false);
            //图片查看器的关闭函数
            function imgViewPortClose(){
                $('#pragations').remove();
                $("#imgViewPort").animate({"opacity":'0.3'},300,function(){
                    $('#imgViewPort').remove();        
                    $('body').css({"height":"auto","overflow":"scroll"});
                })
            };
            //监听“click”事件
           document.addEventListener('click',function(e){
                //调用 关闭函数 
                imgViewPortClose(e);
           });
        },
        /*
            初始化循环滚动,当一次性需要滚动多个子元素时，暂不支持循环滚动效果,
            如果想实现一次性滚动多个子元素效果，可以通过页面结构实现
            循环滚动思路：复制首尾节点到尾首
        */
        init_loop : function(){
            if(this.box.children().length == this.size && this.loop){//暂时只支持size和子节点数相等情况的循环
                this.now_left = -this.width;//设置初始位置信息
                this.minleft = -this.width*this.size;//最小left值
                this.maxleft = -this.width;  
                this.box.css('width',this.width*(this.size+2));
            }else{
                this.loop = false;
                this.box.css('width',this.width*this.size);
            }
        },
        auto_scroll : function(){//自动滚动
            var self = this;
            if(!self.loop || !self.auto)return;
            clearTimeout(self.timer);
            self.timer = setTimeout(function(){
                self.go_index(self.index+1);
            },self.auto_wait_time);
        },
        go_index : function(ind,k){//滚动到指定索引页面
            var self = this;
            var k=k||"";
            if(self.busy)return;
            clearTimeout(self.timer);
            self.busy = true;
            //console.log("LOOP:"+self.loop)
            if(self.loop){//如果循环
                ind = ind<0?-1:ind;
                ind = ind>self.size?self.size:ind;
            }else{
                ind = ind<0?0:ind;
                ind = ind>=self.size?(self.size-1):ind;
            }
            if(!self.loop && (self.now_left == -(self.width*ind))){
                self.complete(ind);
            }else if(self.loop && (self.now_left == -self.width*(ind+1))){
                self.complete(ind);
            }else{
                if(ind == -1 || ind == self.size){//循环滚动边界
                    self.index = ind==-1?(self.size-1):0;
                    self.now_left = ind==-1?0:-self.width*(self.size+1);
                }else{
                    self.index = ind;
                    self.now_left = -(self.width*(self.index+(self.loop?1:0)));
                }
                self.box.css(this.get_style(1,k));
                setTimeout(function(){
                    self.complete(ind);
                },self.scroll_time);
            }
        },
        complete : function(ind){//动画完成回调$("#page")
            var self = this;
            self.busy = false;
            self.config.callback && self.config.callback(self.index);
            if(ind==-1){
                self.now_left = self.minleft;
            }else if(ind==self.size){
                self.now_left = self.maxleft;
            }
            self.box.css(this.get_style(2));
            self.auto_scroll();
        },
        next : function(){//下一页滚动
            if(!this.busy){
                this.go_index(this.index+1);
            }
        },
        prev : function(){//上一页滚动
            if(!this.busy){
                this.go_index(this.index-1);
            }
        },
        move : function(point_x,point_y){//滑动屏幕处理函数
            var changeX = point_x - (this.point_x===null?point_x:this.point_x),
                changeY = point_y - (this.point_y===null?point_y:this.point_y),
                marginleft = this.now_left, return_value = false,
                margintop = this.now_top, return_value = false,
                sin =changeY/Math.sqrt(changeX*changeX+changeY*changeY);
            this.now_left = marginleft+changeX;
            this.now_top=margintop+changeY;
            this.move_left = changeX<0;
            if(sin>Math.sin(Math.PI/3) || sin<-Math.sin(Math.PI/3)){//滑动屏幕角度范围：PI/3  -- 2PI/3
                return_value = true;//不阻止默认行为
            }
            this.point_x = point_x;
            this.point_y = point_y;
            this.box.css(this.get_style(2));
            return return_value;
        },
        move_end : function(){
            var changeX = this.now_left%this.width,ind;
            var changeX_go=false;
            if(changeX>=100||changeX<=-100){
            	changeX_go=true;
            };
           // console.log("changeX_go:"+changeX_go)
            if(this.now_left<this.minleft){//手指向左滑动
                ind = this.index +1;
            }else if(this.now_left>this.maxleft){//手指向右滑动
                ind = this.index-1;
            }else if(changeX!=0){
            	var _num=0;
            	if(changeX_go){
            		_num=1;
            	};
                if(this.move_left){//手指向左滑动
                    ind = this.index+_num;
                }else{//手指向右滑动
                    ind = this.index-_num;
                }
            }else{
                ind = this.index;
            }
            this.point_x = this.point_y = null;
            this.go_index(ind);
             this.box.css(this.get_style(3));
        },
        /*
            获取动画样式，要兼容更多浏览器，可以扩展该方法
            @int fig : 1 动画 2  没动画
        */
        get_style : function(fig,k){
            var x = this.now_left ,y=0,
                time = fig==1?this.scroll_time:300;
            //如果是初始化的时候 time=0;
            var k=k||"";
            if(k){
               time=0; 
            };
            return {
                '-webkit-transition':'-webkit-transform '+time+'ms',
                '-webkit-transform':'translate3d('+(x)+'px,'+y+'px,0)',
                '-webkit-backface-visibility': 'hidden',
                'transition':'transform '+time+'ms',
                'transform':'translate3d('+(x)+'px,'+y+'px,0)'
            };
        }
    	});
    	/*
    	    这里对外提供调用接口，对外提供接口方法
    	    next ：下一页
    	    prev ：上一页
    	    go ：滚动到指定页
    	*/
    	$.ScrollImg = function(box,config){
    	    var scrollImg = new YY.ScrollImg(box,config);
    	    return {//对外提供接口
    	        next : function(){scrollImg.next();},
    	        prev : function(){scrollImg.prev();},
    	        go : function(ind){scrollImg.go_index(parseInt(ind)||0);}
    	    }
    	};
    	var scrollImg = $.ScrollImg('#imgViewPort #imgContainer',{
            loop : false,//循环切换
            auto : false,//自动切换
            callback : function(ind){//这里传过来的是索引值
                $('#page').html(ind+1);
                $('#myPoints span').css("background",initcolor).eq(ind).css("background",currentcolor)
            }
        });
    };
});
