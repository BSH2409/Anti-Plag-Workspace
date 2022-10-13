//var urlbase = "https://aspiringhomes.herokuapp.com/";
var urlbase = window.location.origin + "/";
var ownId = ""
var secId = ""

$(document).ready(function () {
          //bindSelectSector();
         
            $('.single-select').select2();
        
        //validator to check emailId is unique or not
            $.validator.addMethod("haveAccount", function (value) {
                var data = { email: value };
                console.log(JSON.stringify(data));
                var found = $.ajax({
                        type: "POST",
                        contentType: "application/json",
                        async: false,
                        data: {},
                        url: urlbase + "owner/checkAccount/" + value,
                        datatype: "json",
                        success: function (data) {
                            return data;
                        },
                        error: function (error) {
            console.log(error);
          if(!navigator.onLine) swal("You are offline", "", "info");
          else swal("Error!",error.responseText,"error");
        }
                    });
                if (found.responseJSON.match) {
                    return false;
                }
                else {
                    return true;
                }
                //return !found.responseJSON.d;
            }, "Already have an account go and login");
            
            //validator to check user name is available or not
            
            $.validator.addMethod("chkUsername", function (value) {
                
                var data = { username: value };
                var found = $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    async: false,
                    url: urlbase + "minor/checkUsername/" + data.username,
                    data: {},
                    datatype: "json",
                    success: function (data) {
                        return data;
                    },
                    error: function (error) {

          if(!navigator.onLine) swal("You are offline", "", "info");
          else swal("Error!",error.responseText,"error");
                    }

                });
                //console.log(found);
                //console.log(!found.responseJSON.d);
                if (found.responseJSON.match) {
                    return false;
                }
                else {
                    return true;
                }
                //return !found.responseJSON.d;
            }, "Not Available");
            
            
            //setting defaults i.e. border colors
            $.validator.setDefaults({
                highlight: function (element) {
                    $(element).removeClass('fieldset');
                    $(element).addClass('errorhighlight');
                },
                unhighlight: function (element) {
                    $(element).removeClass('errorhighlight');
                    $(element).addClass('fieldset');
                }
            });
            // validate signup form on keyup and submit
            $("#registerPresident").validate({
                invalidHandler: function(form, validator) {
                    var errors = validator.numberOfInvalids();
                    if (errors) {                    
                        validator.errorList[0].element.focus();
                    }
                } ,
                rules: {
                    errorClass: "error have-alert",
                    name: {
                        required: true,
                        minlength: 3,
                        maxlength:40
                    },
                    phone: {
                        required: true,
                        number:true,
                        minlength: 10
                    },
                    email: {
                        required: true,
                        email: true,
                        haveAccount: true
                    },
                    username: {
                        required: true,
                        minlength: 6,
                        maxlength: 20,
                        chkUsername:true
                    },
                    password: {
                        required: true,
                        minlength: 8,
                        maxlength: 20
                    }
                    
                },
                messages: {
                    name: {
                        required: "Please enter your name",
                        minlength: "Minimum 3 characters",
                        maxlength:"Maximun 40 characters"
                    },
                    phone: {
                        required: "Please enter your 10 digit number",
                        minlength: "Minimum 10 digits",
                        number: "Please enter a valid number"
                    },
                    email: {
                        required: "Please enter your email address",
                        email: "Please enter a valid email"
                    },
                    username: {
                        required: "Please enter a username",
                        minlength: "at least 6 characters",
                        maxlength: "at max 20 characters"
                    },
                    password: {
                        required: "Please provide a password",
                        minlength: "at least 8 characters long",
                        maxlength: "at max 20 characters long"
                    }
                    
                }
            });

            function isValid(field) {
                $(field).valid();
            }
            $('#txtName').on("keyup", function () {
                isValid("#txtName");
            });
            $('#txtPhone').on("keyup", function () {
                isValid("#txtPhone");
            });
            $('#txtEmail').on("keyup", function () {
                isValid("#txtEmail");
            });
            $('#txtUsername').on("keyup", function () {
                isValid("#txtUsername");
            });
            $('#txtPassword').on("keyup", function () {
                isValid("#txtPassword");
            });

            //script of showing AF image priview on opening the file
            var custom_AF_btn = $("#choose-AF");
            var main_AF_btn = document.querySelector("#AF_choose");
            custom_AF_btn.on("click", function () {
                main_AF_btn.click();
            });
            main_AF_btn.addEventListener("change", function () {
                $("#images-error").addClass("d-none");
                const wrapper = document.querySelector("#AF-wrapper");
                const img_src = document.querySelector("#AF-img");
                const cancel_btn = document.querySelector("#AF-cancel");

                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function () {
                        const result = reader.result;
                        img_src.src = result;
                        wrapper.classList.add("active");
                    };
                    cancel_btn.addEventListener("click", function () {
                        img_src.src = "";
                        wrapper.classList.remove("active");
                    });
                    reader.readAsDataURL(file);
                }
            
            });
            
            //script of showing AB image priview on opening the file
            var custom_AB_btn = $("#choose-AB");
            var main_AB_btn = document.querySelector("#AB_choose");
            custom_AB_btn.on("click", function () {
                main_AB_btn.click();
            });
            main_AB_btn.addEventListener("change", function () {
                $("#images-error").addClass("d-none");
                const wrapper = document.querySelector("#AB-wrapper");
                const img_src = document.querySelector("#AB-img");
                const cancel_btn = document.querySelector("#AB-cancel");

                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function () {
                        const result = reader.result;
                        img_src.src = result;
                        wrapper.classList.add("active");
                    };
                    cancel_btn.addEventListener("click", function () {
                        img_src.src = "";
                        wrapper.classList.remove("active");
                    });
                    reader.readAsDataURL(file);
                }
            
            });

      });

      function bindSelectSector(){
            $.ajax({
                type: "GET",
                contentType: "application/json",
                url:  urlbase +  "owner/getSectors/" + ownId,
                data: {},
                datatype: "json",
                success: function (response) {
                    if (response.result.length > 0) {
                        //console.log(response.result)
                        $("#drpSectors").html("");
                        var list = "";
                        for (var i = 0; i < response.result.length; i++) {
                            list = list + "<option value='" + response.result[i].id + "'>" + response.result[i].name + "</option>";
                        }

                        $("#drpSectors").append(list);
                        $('#drpSectors').val(secId);
                    }
                    else {
                        console.log("no data");
                    }
                },
                error: function (error) {

          if(!navigator.onLine) swal("You are offline", "", "info");
          else swal("Error!",error.responseText,"error");
                   
                    //alert('error : ' + error);
                    console.log(error);

                }
            });
        }


        function show_password(){
            //console.log("in");
            const show = document.querySelector("#show_password i");
            const field = document.querySelector("#txtPassword");
            show.classList.add("hide-btn");
            if (field.type === "password") {
                field.type = "text";
                show.classList.add("hide-btn");
            } else {
                field.type = "password";
                show.classList.remove("hide-btn");
            }
        }
        function show_password_owner(){
            //console.log("in");
            const show = document.querySelector("#show_password_owner i");
            const field = document.querySelector("#txtOwnerPassword");
            show.classList.add("hide-btn");
            if (field.type === "password") {
                field.type = "text";
                show.classList.add("hide-btn");
            } else {
                field.type = "password";
                show.classList.remove("hide-btn");
            }
        }

        
      $("#btnRegister").click(function (e) { 
            
          e.preventDefault();
          var afw = $("#AF-wrapper");
          var abw = $("#AB-wrapper");
          var af = $("#AF_choose");
          var ab = $("#AB_choose");
          if($("#registerPresident").valid()){
            if(!$("#user-agree").prop('checked')){
                swal("Information!", "Make sure to read and agree the Terms and Conditions", "info");
            }
            else if(!$("#AF-wrapper").hasClass("active")){
                $("#images-error").html("Please Upload Aadhar card Front Image");
                $("#images-error").removeClass("d-none");
                return;
            }
            else if(!$("#AB-wrapper").hasClass("active")){
                $("#images-error").html("Please Upload Aadhar card Back Image");
                $("#images-error").removeClass("d-none");
                return;
            }
            else{
                var afimg = af.get(0).files[0];
                var abimg = ab.get(0).files[0];
                
                var images = new FormData();
                images.append("front",afimg);
                images.append("back",abimg);
                $.ajax({
                    url: urlbase + 'president/saveImages',
                    type: "POST",
                    async:false,
                    contentType: false, // Not to set any content header
                    processData: false, // Not to process data
                    data: images,
                    beforeSend: function () {
                        $("#saving").modal({
                            show: true,
                            backdrop: 'static',
                            keyboard:false
                        });
                    },
                    success: function (response) {
                        insertPresident(response);
                        //console.log(response);
                        
                    },
                    error: function (err) {
                        alert(err.statusText);
                    }
                });
              //console.log(images);
          }

          }
          
          
          
          
      });

      function insertPresident(path){
        var sId = $('#drpSectors :selected').val();
        let d = moment();
        var record = {
                name: $("#txtName").val(),
                phone: $("#txtPhone").val(),
                email: $("#txtEmail").val(),
                username: $("#txtUsername").val(),
                password: $("#txtPassword").val(),
                secId: sId,
                aadharFront:path.front,
                aadharBack:path.back,
                profile: "",
                date: d.format("YYYY-MM-DD")                        
        };
        
        //console.log(data);
        $.ajax({
            type: "POST",
            contentType: "application/json",
            async: true,
            url: urlbase + "president/insertPresident",
            data: JSON.stringify(record),
            datatype: "json",
            beforeSend: function () {
                    $("#saving").modal({
                    show: true,
                    backdrop: 'static',
                    keyboard:false
                });
            },
            success: function (response) {
                var data = {
                    username:record.username,
                    password:record.password
                }

                swal("Congratulations!", "Hey, " + record.name + " your application is registered and sent for verification! You will notified on your email about the status soon", "success");
                $(".swal-button--confirm").click(function () {
                    data = {username:"",password:""};
                    localStorage.setItem("rup-user",JSON.stringify(data));
                    window.location = "index.html";
                })
                setTimeout(function () {
                    data = {username:"",password:""};
                    localStorage.setItem("rup-user",JSON.stringify(data));
                    window.location = "index.html";
                },3000);
                //console.log(response);
            },
            error: function (error) {

          if(!navigator.onLine) swal("You are offline", "", "info");
          else swal("Error!",error.responseText,"error");
                console.log(error);
            }
        });
      }

      $("#btnContinue").click(function (e) {
           
        e.preventDefault();
            $("#divWC").addClass("d-none");
            $("#divA").addClass("d-none");
            $("#divP").addClass("d-none");
        var u = $("#txtOwnerUsername");
        var p = $("#txtOwnerPassword")
        u.on('keyup',function(){
        u.addClass("error");
        if(u.val()!=""){
            u.removeClass("error");
            $("#divWC").addClass("d-none");
            $("#divA").addClass("d-none");
            $("#divP").addClass("d-none");
        }
        });
        p.on('keyup',function(){
        p.addClass("error");
        if(p.val()!=""){
            p.removeClass("error");
            $("#divWC").addClass("d-none");
            $("#divA").addClass("d-none");
            $("#divP").addClass("d-none");
        }
        });
        if(u.val()==""){
            u.addClass("error");
            u.focus();
        }
        
        else if(p.val()==""){
            p.addClass("error");
            p.focus();
        }
        
        if(u.val()!="" && p.val()!=""){
        var data = {
            username:u.val(),
            password:p.val()
        }
        $.ajax({
            type: "POST",
            contentType: "application/json",
            async: true,
            url: urlbase + "owner/findOwner",
            data: JSON.stringify(data),
            datatype: "json",
            beforeSend: function(){
                //$("#checking").modal('show');
            },
            success: function (response) {
                //$("#checking").modal('hide');
                if(!response.match){
                    $("#divWC").removeClass("d-none");
                }
                else if(response.applied =="1"){
                    $("#divP").removeClass("d-none");
                }
                else if(response.applied == "2"){
                    $("#divA").removeClass("d-none");
                }
                else{
                    setPresidentForm(data);
                }
                //console.log(response);
            },
            error: function (error) {

          if(!navigator.onLine) swal("You are offline", "", "info");
          else swal("Error!",error.responseText,"error");
                console.log(error);
            }
        });

        //console.log(data);
        
        }

        //$("#login").modal('hide');
      });

      function setPresidentForm(data){
        $("#div-authenticate").addClass("d-none");
        $("#div-register").removeClass("d-none");
        $.ajax({
            type: "POST",
            contentType: "application/json",
            async: true,
            url: urlbase + "owner/getBasicData",
            data: JSON.stringify(data),
            datatype: "json",
            beforeSend: function(){
                //$("#checking").modal('show');
            },
            success: function (response) {
                //$("#checking").modal('hide');
                ownId = response.ownId;
                $("#txtName").val(response.name);
                $("#txtPhone").val(response.phone);
                $("#txtEmail").val(response.email);
                $("#txtEmail").attr('disabled',true);

                secId = response.secId;
                bindSelectSector();
                //$('#drpSectors').val(response.secId);
                //$("#drpSectors").attr('disabled',true);
            },
            error: function (error) {

          if(!navigator.onLine) swal("You are offline", "", "info");
          else swal("Error!",error.responseText,"error");
                console.log(error);
            }
        });
      }

      