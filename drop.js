// dependencies: common.js, loaders.js

var Drop = function (name, settings) {
  settings = settings || {};

  var me = this;

  me.name = name;
  me.size = settings["size"] || new Size(64, 64);

  me.imagePath = settings["imagePath"] || "./images/";

  me.images = {
    buttons : {
      YES : me.imagePath + 'drop-button-yes.png',
      NO : me.imagePath + 'drop-button-no.png'
    },
    messages : {
      CHECK : me.imagePath + 'drop-sign-check.png',
      TOOBIG : me.imagePath + 'toobig.png',
      TOOSMALL : me.imagePath + 'toosmall.png',
      ONLYIMAGES : me.imagePath + 'onlyimages.png',
      NOPREVIEW : me.imagePath + 'nopreview.png'
    },
    icons : {
      DROPIMAGE : me.imagePath + 'dropimage.png',
      CLOUDUPLOAD : me.imagePath + 'cloudupload.png'
    }
  };

  me.phpScripts = {
    checkFile : "./php/check-file.php",
    upload : "./php/upload.php"
  };

  me.settings = {
    alternativeStatusField : settings["alternativeStatusField"],
    defaultThumbImg : settings["defaultThumbImg"] || me.images.icons.CLOUDUPLOAD,
    minFileSize : settings["minFileSize"] || 100,
    maxFileSize : settings["maxFileSize"] || 10000,
    acceptImageFirst : settings["acceptImageFirst"] == true || settings["acceptImageFirst"] == null,
    displayUploadButton : settings["displayUploadButton"] || false,
    displaySubmitButton : settings["displaySubmitButton"] || false,
    allowMultipleFileUpload : settings["allowMultipleFileUpload"] || false,
    uploadAllowed : settings["uploadAllowed"] || true,
    fakeUpload : settings["fakeUpload"] || false,
    resizeOnYesNoOption : settings["resizeOnYesNoOption"] || {
      active : true,
      sizeFactor : new Location(1.5, 1.2),
      resized : false
    },
    showUploadedImages : settings["showUploadedImages"] ||  true,
    uploadTimeout : settings["uploadTimeout"] || 20,
    maxThumbSizeFactor : settings["maxThumbSizeFactor"] || new Location(0.6, 0.8),
    thumbnailScalingFactor : settings["thumbnailScalingFactor"] || 0.3,
    onUploadFunction : settings["onUploadFunction"] || null
  };

  me.buttons = {
    list : [],
    showButton : function showButton (id, effect, speed) {
      if (effect != null && speed != null) {
        $("#" + me.name + "-button-" + id).show(effect, speed);
      } else {
        $("#" + me.name + "-button-" + id).show();
      }
    },
    hideButton : function hideButton (id, effect, speed) {
      if (effect != null && speed != null) {
        $("#" + me.name + "-button-" + id).hide(effect, speed);
      } else {
        $("#" + me.name + "-button-" + id).hide();
      }
    },
    destroyButton : function (id, effect, speed) {
      for (var i = 0; i < me.buttons.list.length; i++) {
        if (me.buttons.list[i].id == id) {
          me.buttons.list.splice(i, 1);
          var $button = $("#" + me.name + "-button-" + id);

          if (effect != null && speed != null) {
            $button.hide(effect, speed, function () {
              $(this).remove();
            });
          } else {
            $button.hide(null, null, function () {
              $(this).remove();
            });
          }

          return true;
        }
      }
    },
    destroyAllButtons : function (effect, speed, exclude) {
      for (var i = 0; i < me.buttons.list.length; i++) {
        var passed = true;

        if (exclude) {
          for (var u = 0; u < exclude.length; u++) {
            if (me.buttons.list[i].id == exclude[u]) {
              passed = false;
            }
          }
        }

        if (passed) {
          if (effect != null && speed != null) {
            me.buttons.list[i].Representation().hide(effect, speed, function () {
              $(this).remove();
            });
          } else {
            me.buttons.list[i].Representation().remove();
          }

          me.buttons.list.splice(i, 1);
          i--;
        }
      }

      if (!exclude) {
        me.buttons.list = [];
      }
    },
    buttonByName : function (name) {
      for (var i = 0; i < me.buttons.list.length; i++) {
        if (me.buttons.list[i].id == name) {
          return me.buttons.list[i];
        }
      }

      return false;
    },
    createMultiButtonContainer : function createMultiButtonContainer (name, $buttonArray, settings) {
      if (!settings) {
        settings = {};
      }

      if (!settings["size"]) {
        settings["autoSize"] = true;
      }

      var buttonContainer = {
        name : me.name + "-button-" + name,
        size : settings["size"] || new Size(64, 64),
        clickEvent : settings["click"] || function () {},
        template : document.createElement("div"),
        Representation : function () {
          return $("#" + buttonContainer.name);
        },
        offset : settings["offset"] || new Location(0, 0),
        id : name,
        buttons : []
      };

      for (var i = 0; i < me.buttons.list.length; i++) {
        if (me.buttons.list[i].name == buttonContainer.name) {
          me.buttons.destroyButton(me.buttons.list[i].id);
        }
      }

      function createContainerTemplate () {
        buttonContainer.template.id = buttonContainer.name;
        buttonContainer.template.className = "multi-button-container";
        buttonContainer.template.style.width = buttonContainer.size.width + "px";
        buttonContainer.template.style.height = buttonContainer.size.height + "px";
        buttonContainer.template.style.position = "absolute";

        if (settings["autoSize"]) {
          buttonContainer.template.style.height = "auto";
        }

        if (settings["effect"]) {
          buttonContainer.template.style.display = "none";
        }
      }

      function putButtonAtRightPosition () {
        buttonContainer.Representation().css("margin-top", me.Representation().height() / 2 -
        buttonContainer.Representation().height() / 2 +
        buttonContainer.offset.y);
        buttonContainer.Representation().css("left", me.Representation().width() / 2 +
        parseInt(me.Representation().css("margin-left").replace("px", "")) -
        buttonContainer.Representation().width() / 2 +
        buttonContainer.offset.x);
      }

      $(me.DropZoneContainer()).prepend(buttonContainer.template);

      for (var x = 0; x < $buttonArray.length; x++) {
        buttonContainer.buttons.push($buttonArray[x]);
      }

      createContainerTemplate();
      putButtonAtRightPosition();

      buttonContainer.Representation().click(buttonContainer.click);

      me.buttons.list.push(buttonContainer);

      if (settings["effect"]) {
        for (var e = 0; e < $buttonArray.length; e++) {
          buttonContainer.Representation().append($buttonArray[e]);
          $buttonArray[e].show(settings["effect"], 400);
        }

        buttonContainer.Representation().show(settings["effect"], 400);
      }
    },
    addButton : function addButton (name, settings) {
      if (!settings) {
        settings = {};
      }

      if (!settings["size"]) {
        settings["autoSize"] = true;
      }

      var button = {
        name : me.name + "-button-" + name,
        image : settings["image"] || "./images/none.png",
        size : settings["size"] || new Size(64, 64),
        click : settings["click"] || function () {},
        template : null,
        Representation : function () {
          return $("#" + button.name);
        },
        offset : settings["offset"] || new Location(0, 0),
        id : name
      };

      for (var i = 0; i < me.buttons.list.length; i++) {
        if (me.buttons.list[i].name == button.name) {
          me.buttons.destroyButton(me.buttons.list[i].id);
        }
      }

      function createButtonTemplate () {
        button.template = document.createElement("img");
        button.template.width = button.size.width;
        button.template.height = button.size.height;
        button.template.id = button.name;
        button.template.src = button.image;
        button.template.className = "drop-button";
        button.template.style.position = "absolute";

        if (settings["autoSize"]) {
          button.template.style.height = "auto";
        }

        if (settings["effect"]) {
          button.template.style.display = "none";
        }
      }

      function putButtonAtRightPosition () {
        button.Representation().css("margin-top", me.Representation().height() / 2 -
        button.Representation().height() / 2 +
        button.offset.y + "px");
        button.Representation().css("left", me.Representation().width() / 2 +
        parseInt(me.Representation().css("margin-left").replace("px", "")) -
        button.Representation().width() / 2 +
        button.offset.x + "px");
      }

      createButtonTemplate();
      $(me.DropZoneContainer()).prepend(button.template);
      putButtonAtRightPosition();
      button.Representation().click(button.click);

      me.buttons.list.push(button);

      if (settings["effect"]) {
        button.Representation().show(settings["effect"], 400);
      }
    },
    addYesNoChoice : function addYesNoChoice () {
      me.buttons.addButton("yes", {
        image : me.images.buttons.YES,
        click : function (e) {
          if (me.settings.fakeUpload) {
            me.fileUpload.uploadTypes.fakeUpload();
          } else {
            me.fileUpload.uploadTypes.saveFileOnServer();
          }

          e.preventDefault();
          e.stopPropagation();
        },
        offset : new Location(
          (me.Representation().width() / 2) -
          (me.Representation().width() / 12) - 18, 0),
        effect : "fade" });

      me.buttons.addButton("no", {
        image : me.images.buttons.NO,
        click : function (e) {
          me.fileUpload.returns.uploadWasCancelled();

          e.preventDefault();
          e.stopPropagation();
        },
        offset : new Location(
          - (me.Representation().width() / 2) + me.Representation().width() / 12,
          0),
        effect : "fade" });
    },
    centerButtons : function centerButtons (horizontal, vertical) {
      if (!(horizontal || vertical)) {
        horizontal = true;
        vertical = true;
      }

      for (var i = 0; i < me.buttons.list.length; i++) {
        var button = me.buttons.list[i];
        if (horizontal) {
          button.Representation().css("margin-top", me.Representation().height() / 2 -
          button.Representation().height() / 2 +
          button.offset.y);
        }
        if (vertical) {
          button.Representation().css("left", me.Representation().width() / 2 +
          parseInt(me.Representation().css("margin-left").replace("px", "")) -
          button.Representation().width() / 2 +
          button.offset.x);
        }
      }
    }
  };

  me.loader = function loader () {
    if (!me.Loader) {
      me.Loader = createLoader(LOADERS.SIMPLE_GREY_BIG, me.name + "-loader", new Size(64, 64));
      me.Loader.Representation().css("position", "absolute");

      $(me.DropZoneContainer()).prepend(me.Loader.Representation());

      me.Loader.Representation().css("margin-top", me.Representation().height() / 2 - me.Loader.Representation().height() / 2);
      me.Loader.Representation().css("margin-left", me.Representation().width() / 2 - me.Loader.Representation().width() / 2);
    } else {
      me.Loader.Representation().css("margin-top", me.Representation().height() / 2 - me.Loader.Representation().height() / 2);
      me.Loader.Representation().css("margin-left", me.Representation().width() / 2 - me.Loader.Representation().width() / 2);
      me.Loader.Representation().show();
    }
  };

  me.hideLoader = function () {
    if (me.Loader) {
      me.Loader.Representation().hide();
    }
  };

  me.sizeAndLocation = {
    updateRelativeSizes : function updateRelativeSizes () {
      me.size = new Size(me.Representation().width(), me.Representation().height());
      me.ThumbImg.defaultThumbSize = new Size(me.ThumbImg.defaultThumbSizeTemplate.width,
        me.ThumbImg.defaultThumbSizeTemplate.height);
      me.ThumbImg.thumbnailSize = new Size(
        me.ThumbImg.Representation().width(),
        me.ThumbImg.Representation().width());
    },
    width : function width () {
      return me.Representation().width();
    },
    height : function height () {
      return me.Representation().height();
    },
    resize : function resize (size) {
      me.size = size;

      me.Representation().width(size.width + "px");
      me.Representation().height(size.height + "px");
    },
    smoothResize : function (size, speed, func) {
      me.Representation().animate({
        width : size.width + "px",
        height : size.height + "px"
      }, speed, function () {
        me.size = size;
        if (func) {
          func();
        }
      });
    },
    restoreActualPanelSize : function (func) {
      me.ThumbImg.Representation().hide("fade", 400, function () {
        if (me.settings.resizeOnYesNoOption.active && me.settings.resizeOnYesNoOption.resized) {
          me.settings.resizeOnYesNoOption.resized = false;
          me.sizeAndLocation.smoothResize(
            new Size(me.size.width / me.settings.resizeOnYesNoOption.sizeFactor.x,
              me.size.height / me.settings.resizeOnYesNoOption.sizeFactor.y),
            400,
            function () {
              if (func) {
                func();
              }
            }
          );
        } else {
          if (func) {
            func();
          }
        }
      });
    }
  };

  me.fileUpload = {
    lastUploadedFile : null,
    files : [],
    file : null,
    file64 : null,
    uploadedFileVerified : null,
    uploadAllowed : true,
    reader : new FileReader(),
    checkIfFileWasUploaded : function checkIfFileWasUploaded (filename) {
      me.fileUpload.uploadedFileVerified = null;

      if (me.fileUpload.lastUploadedFile != null) {
        $.post(me.phpScripts.checkFile, { name : filename }, function (response) {
          me.fileUpload.uploadedFileVerified = (response == "true");
        }, 'json');
      }
    },
    uploadTypes : {
      askBeforeUpload : function askBeforeUpload () {
        me.fileUpload.uploadAllowed = false;

        if (me.settings.allowMultipleFileUpload) {
          log("This feature is not implemented yet.", "askBeforeUpload with multiple files");
        } else {
          me.fileUpload.reader.onload = function(event) {
            me.fileUpload.file64 = event.target.result;
            if (me.settings.resizeOnYesNoOption.active && !me.settings.resizeOnYesNoOption.resized) {
              me.settings.resizeOnYesNoOption.resized = true;
              me.sizeAndLocation.smoothResize(
                new Size(
                  me.size.width * me.settings.resizeOnYesNoOption.sizeFactor.x,
                  me.size.height * me.settings.resizeOnYesNoOption.sizeFactor.y), 400,
                function () {
                  me.ThumbImg.calculateMaxThumbSize();
                  me.ThumbImg.changeThumbImg(me.fileUpload.file64, 500,
                    new Size(
                      me.ThumbImg.uploadedImageSize.width,
                      me.ThumbImg.uploadedImageSize.height));
                  me.buttons.addYesNoChoice();
                }
              );
            } else {
              me.ThumbImg.calculateMaxThumbSize();
              me.ThumbImg.changeThumbImg(me.fileUpload.file64, 500,
                new Size(
                  me.ThumbImg.uploadedImageSize.width,
                  me.ThumbImg.uploadedImageSize.height));
              me.buttons.addYesNoChoice();
            }
          };

          if (me.fileUpload.isValidFile()) {
            me.fileUpload.reader.readAsDataURL(me.fileUpload.file);
          }
        }
      },
      saveFileOnServer : function saveFileOnServer () {
        me.loader();
        me.ThumbImg.Representation().hide("fade", 400, function () {
          if (me.settings.allowMultipleFileUpload) {
            log("multiple file upload is not final. Please extend / use with care.", "saveFileOnServer with multiple files");
            for (var i = 0; i < me.fileUpload.files.length; i++) {
              me.reader.onload = function(event) {
                me.fileUpload.file64 = event.target.result;
                $.post(me.phpScripts.upload, { 'file' : me.fileUpload.file64 }, function (filename) {
                  me.fileUpload.lastUploadedFile = filename;
                  me.ThumbImg.changeThumbImg(me.fileUpload.file64, 500,
                    new Size(
                      me.fileUpload.uploadedImageSize.width,
                      me.fileUpload.uploadedImageSize.height));
                  me.Loader.Representation().hide();
                }, 'json');
              };

              me.fileUpload.file = me.fileUpload.files[i];

              if (me.fileUpload.isValidFile()) {
                me.fileUpload.reader.readAsDataURL(me.fileUpload.file);
              }
            }
          } else {
            me.fileUpload.reader.onload = function(event) {
              me.fileUpload.file64 = event.target.result;
              $.post(me.phpScripts.upload, { 'file' : me.fileUpload.file64 }, function (filename) {
                me.fileUpload.lastUploadedFile = filename;

                relativeRepeaterFunction(function () {
                  if (me.fileUpload.uploadedFileVerified) {
                    me.buttons.destroyAllButtons("fade", 200);
                    me.Loader.Representation().hide();
                    me.ThumbImg.changeThumbImg(me.images.messages.CHECK, 500, new Size(64, "auto"));
                    processManager.removeProcess(this);
                    setTimeout(function () {
                      if (me.settings.onUploadFunction) {
                        me.settings.onUploadFunction();
                      }
                    }, 2000);
                  } else {
                    me.fileUpload.checkIfFileWasUploaded(me.fileUpload.lastUploadedFile);
                  }
                }, true, "is", true, null, 500, null, me.settings.uploadTimeout, function () {
                  me.fileUpload.returns.fileWasTooBig();
                });
              }, 'json');
            };

            if (me.fileUpload.isValidFile()) {
              me.fileUpload.reader.readAsDataURL(me.fileUpload.file);
            }
          }
        });
      },
      fakeUpload : function () {
        if (me.settings.acceptImageFirst) {
          me.buttons.destroyAllButtons();
        }

        me.loader();

        setTimeout(function () {
          me.fileUpload.lastUploadedFile = me.fileUpload.file.name;
          me.fileUpload.uploadedFileVerified = true;

          me.Loader.Representation().hide();
          me.ThumbImg.changeThumbImg(me.images.messages.CHECK, 500, new Size(64, "auto"));
        }, 1000);
      }
    },
    returns : {
      fileWasTooSmall : function () {
        me.hideLoader();

        if (me.settings.acceptImageFirst) {
          me.buttons.destroyAllButtons();
        }

        function fileWasTooSmallReturn () {
          if (me.settings.alternativeStatusField) {
            var altStatusField = me.buttonByName(me.settings.alternativeStatusField);
            altStatusField.Representation().attr("src", me.images.messages.TOOSMALL);
            altStatusField.Representation().height("auto");
            altStatusField.Representation().effect("bounce", 600);
          } else {
            me.ThumbImg.changeThumbImg(me.images.messages.TOOSMALL, 500, new Size(300, 71), null, true);
          }

          me.fileUpload.uploadedFileVerified = null;
          me.fileUpload.uploadAllowed = true;
          me.fileUpload.file = null;
          me.fileUpload.file64 = null;
          $("#" + me.name + "-choose").val("");
        }

        me.sizeAndLocation.restoreActualPanelSize(fileWasTooSmallReturn);
      },
      fileWasTooBig : function () {
        me.hideLoader();

        if (me.settings.acceptImageFirst) {
          me.buttons.destroyAllButtons();
        }

        function fileWasTooBigReturn () {
          if (me.settings.alternativeStatusField) {
            var altStatusField = me.buttonByName(me.settings.alternativeStatusField);
            altStatusField.Representation().attr("src", me.images.messages.TOOBIG);
            altStatusField.Representation().height("auto");
            altStatusField.Representation().effect("bounce", 600);
          } else {
            me.ThumbImg.changeThumbImg(me.images.messages.TOOBIG, 500, new Size(300, 72), null, true);
          }

          me.fileUpload.uploadedFileVerified = null;
          me.fileUpload.uploadAllowed = true;
          me.fileUpload.file = null;
          me.fileUpload.file64 = null;
          $("#" + me.name + "-choose").val("");
        }

        me.sizeAndLocation.restoreActualPanelSize(fileWasTooBigReturn);
      },
      invalidFile : function () {
        me.hideLoader();

        if (me.settings.acceptImageFirst) {
          me.buttons.destroyAllButtons();
        }

        function invalidFileReturn () {
          if (me.settings.alternativeStatusField) {
            var altStatusField = me.buttonByName(me.settings.alternativeStatusField);
            altStatusField.Representation().attr("src", me.images.messages.ONLYIMAGES);
            altStatusField.Representation().height("auto");
            altStatusField.Representation().effect("bounce", 600);
          } else {
            me.ThumbImg.changeThumbImg(me.images.messages.ONLYIMAGES, 500, new Size(300, 125), null, true);
          }

          me.fileUpload.uploadedFileVerified = null;
          me.fileUpload.uploadAllowed = true;
          me.fileUpload.file = null;
          me.fileUpload.file64 = null;
          $("#" + me.name + "-choose").val("");
        }

        me.sizeAndLocation.restoreActualPanelSize(invalidFileReturn);
      },
      uploadWasCancelled : function () {
        me.hideLoader();

        if (me.settings.acceptImageFirst) {
          me.buttons.destroyAllButtons();
        }

        function uploadCancelledReturn () {
          me.sizeAndLocation.updateRelativeSizes();
          me.ThumbImg.calculateMaxThumbSize();
          me.ThumbImg.changeThumbImg(me.settings.defaultThumbImg, 500, me.ThumbImg.defaultThumbSize);
          me.fileUpload.uploadedFileVerified = null;
          me.fileUpload.uploadAllowed = true;
          me.fileUpload.file = null;
          me.fileUpload.file64 = null;
          $("#" + me.name + "-choose").val("");
        }

        me.sizeAndLocation.restoreActualPanelSize(uploadCancelledReturn);
      }
    },
    isValidFile : function () {
      if (me.fileUpload.file.type.match('image.*') &&
        (me.fileUpload.file.type.match('png') ||
        me.fileUpload.file.type.match('jpg') ||
        me.fileUpload.file.type.match('jpeg'))) {
        if (me.fileUpload.file.size / 1000 < me.settings.maxFileSize) {
          if (me.fileUpload.file.size / 1000 > me.settings.minFileSize) {
            return true;
          } else {
            me.fileUpload.returns.fileWasTooSmall();
            return false;
          }
        } else {
          me.fileUpload.returns.fileWasTooBig();
          return false;
        }
      } else {
        me.fileUpload.returns.invalidFile();
        return false;
      }
    }
  };

  me.Representation = function Representation () {
    return $("#" + me.name);
  };

  me.DragAndDropZone = function DragAndDropZone () {
    return $("#" + me.name + ", #" + me.name + "-img");
  };

  me.ThumbImg = {
    defaultThumbSizeTemplate : new Size(me.size.width / 3, "auto"),
    defaultThumbSize : new Size(me.size.width / 3, "auto"),
    maxThumbSize : new Size("auto", "auto"),
    uploadedImageSize : new Size("auto", "auto")
  };

  me.ThumbImg = {
    defaultThumbSizeTemplate : new Size(me.ThumbImg.defaultThumbSizeTemplate.width,
      me.ThumbImg.defaultThumbSizeTemplate.height),
    defaultThumbSize : me.ThumbImg.defaultThumbSize,
    maxThumbSize : me.ThumbImg.maxThumbSize,
    uploadedImageSize : me.ThumbImg.uploadedImageSize,
    thumbnailSize : new Size( me.ThumbImg.defaultThumbSize.width, me.ThumbImg.defaultThumbSize.height),
    Representation : function ThumbImg () {
      return $("#" + me.name + "-img");
    },
    calculateMaxThumbSize : function calculateMaxThumbSize () {
      me.ThumbImg.maxThumbSize = new Size(
        me.Representation().width() * me.settings.maxThumbSizeFactor.x,
        me.Representation().height() * me.settings.maxThumbSizeFactor.y);
    },
    setDefaultUploadedImgSize : function (size) {
      me.ThumbImg.uploadedImageSize = size;
    },
    setMaximumThumbnailSize : function (size) {
      me.ThumbImg.maxThumbSize = size;
    },
    changeThumbImg : function changeThumbImg (image, speed, size, effect) {
      if (!effect) {
        effect = "fade";
      }

      me.ThumbImg.Representation().hide(effect, speed, function () {
        if (image == me.ThumbImg.Representation().attr("src")) {
          if (size) {
            me.ThumbImg.resizeThumbImg(size);
          }
          me.ThumbImg.centerThumbImg();
          me.ThumbImg.Representation().show(effect, speed, function () {
            me.ThumbImg.centerThumbImg();
          });
        } else {
          me.ThumbImg.Representation().attr("src", image);
          me.ThumbImg.Representation().load(function () {
            if (size) {
              me.ThumbImg.resizeThumbImg(size);
            }
            me.ThumbImg.centerThumbImg();
            me.ThumbImg.Representation().show(effect, speed, function () {
              me.ThumbImg.centerThumbImg();
            });
          });
        }
      });
    },
    resizeThumbImg : function resizeThumbImg (size) {
      function convertRelativeSizes () {
        me.ThumbImg.Representation().css("width", size.width);
        me.ThumbImg.Representation().css("height", size.height);
        size.width = me.ThumbImg.Representation().width();
        size.height = me.ThumbImg.Representation().height();
      }

      convertRelativeSizes();

      function applyWidthAndRepeat () {
        me.ThumbImg.Representation().css("height", "auto");
        me.ThumbImg.Representation().css("width", size.width);
        me.ThumbImg.resizeThumbImg(new Size(me.ThumbImg.Representation().width(),
          me.ThumbImg.Representation().height()));
      }

      function applyHeightAndRepeat () {
        me.ThumbImg.Representation().css("width", "auto");
        me.ThumbImg.Representation().css("height", size.height);
        me.ThumbImg.resizeThumbImg(new Size(me.ThumbImg.Representation().width(),
          me.ThumbImg.Representation().height()));
      }

      function shrinkAndTryAgain () {
        me.ThumbImg.resizeThumbImg(new Size(
          size.width * me.settings.thumbnailScalingFactor,
          size.height * me.settings.thumbnailScalingFactor));
      }

      if (size.height > me.ThumbImg.maxThumbSize.height &&
        size.width > me.ThumbImg.maxThumbSize.width) {
        shrinkAndTryAgain();
        return 0;
      }

      if (size.width > me.ThumbImg.maxThumbSize.width &&
        size.height < me.ThumbImg.maxThumbSize.height) {
        size.width = me.ThumbImg.maxThumbSize.width;
        applyWidthAndRepeat();
        return 0;
      }

      if (size.height > me.ThumbImg.maxThumbSize.height &&
        size.width < me.ThumbImg.maxThumbSize.width) {
        size.height = me.ThumbImg.maxThumbSize.height;
        applyHeightAndRepeat();
        return 0;
      }
    },
    centerThumbImg : function centerThumbImg () {
      var center = me.Representation().height() / 2 -
        me.ThumbImg.Representation().height() / 2;
      me.ThumbImg.Representation().css("margin-top", center + "px");
    }
  };

  me.core = {
    initialized : false,
    ready : false,
    create : function create () {
      var form = document.createElement("form");
      var field = document.createElement("div");
      var img = document.createElement("img");
      var upload = document.createElement("input");

      form.id = me.name;
      form.action = "upload.php";
      form.method = "post";
      form.enctype = "multipart/form-data";
      form.style.width = me.size.width + "px";
      form.style.height = me.size.height + "px";
      form.className = "drop-form";

      field.id = me.name + "-image";
      field.className = "whitebg drop-field";

      img.src = me.settings.defaultThumbImg;
      img.id = me.name + "-img";
      img.className = "drop-img";
      img.style.width = me.ThumbImg.thumbnailSize.width + "px";
      img.style.height = me.ThumbImg.thumbnailSize.height + "px";
      img.style.display = "none";

      upload.id = me.name + "-choose";
      upload.type = "file";
      upload.name = "design";
      if (me.settings.allowMultipleFileUpload) {
        upload.multiple = "true";
      }

      if (!me.settings.displayUploadButton) {
        upload.style.display = "none";
      }

      var submit = document.createElement("input");

      submit.id = me.name + "-submit";
      submit.type = "submit";
      submit.value = "submit";

      if (!me.settings.displaySubmitButton) {
        submit.style.display = "none";
      }

      field.appendChild(img);
      form.appendChild(field);
      form.appendChild(upload);
      form.appendChild(submit);

      me.template = form;
    },
    init : function init () {
      me.Representation().click(function (e) {
        if (me.fileUpload.uploadAllowed) {
          me.ChooseButton().click();
        }
        e.stopPropagation();
      });

      me.ChooseButton().click(function (e) {
        e.stopPropagation();
      });

      me.ChooseButton().change(function (event) {
        if (event.target.files != null) {
          for (var i = 0; i < event.target.files.length; i++) {
            if (me.settings.allowMultipleFileUpload) {
              me.fileUpload.files.push(event.target.files[i]);
            } else {
              me.fileUpload.file = event.target.files[0];
              if (!me.settings.acceptImageFirst) {
                me.fileUpload.uploadTypes.saveFileOnServer();
              } else {
                me.fileUpload.uploadTypes.askBeforeUpload();
              }
            }
          }

          if (me.settings.allowMultipleFileUpload) {
            if (!me.settings.acceptImageFirst) {
              me.fileUpload.uploadTypes.saveFileOnServer();
            } else {
              me.fileUpload.uploadTypes.askBeforeUpload();
            }
          }
        }
      });

      me.DragAndDropZone().on("dragover", function(event){
        event.preventDefault();
        event.stopPropagation();
        event.originalEvent["dataTransfer"].dropEffect = 'copy';
      });

      me.DragAndDropZone().on("drop", function(event){
        if (me.fileUpload.uploadAllowed) {
          event.preventDefault();
          event.stopPropagation();
          for (var i = 0; i < event.originalEvent["dataTransfer"].files.length; i++) {
            if (me.settings.allowMultipleFileUpload) {
              me.fileUpload.files.push(event.originalEvent["dataTransfer"].files[i]);
            } else {
              me.fileUpload.file = event.originalEvent["dataTransfer"].files[0];

              if (!me.settings.acceptImageFirst) {
                me.fileUpload.uploadTypes.saveFileOnServer();
              } else {
                me.fileUpload.uploadTypes.askBeforeUpload();
              }
            }
          }

          if (me.settings.allowMultipleFileUpload) {
            if (!me.settings.acceptImageFirst) {
              me.fileUpload.uploadTypes.saveFileOnServer();
            } else {
              me.fileUpload.uploadTypes.askBeforeUpload();
            }
          }
        }
      });

      me.sizeAndLocation.updateRelativeSizes();
      me.core.initialized = true;
    }
  };

  this.ChooseButton = function ChooseButton () {
    return $("#" + me.name + "-choose");
  };

  this.SubmitButton = function SubmitButton () {
    return $("#" + me.name + "-submit");
  };

  this.DropZoneContainer = function DropZoneContainer () {
    return $("#" + me.name + "-image");
  };

  this.placeAfter = function placeAfter ($element) {
    $element.append(me.template);
  };

  this.placeBefore = function placeBefore ($element) {
    $element.prepend(me.template);
  };
};

var DropFields = {};

function addDropField(name, settings) {
  settings = settings || {};

  if (DropFields.hasOwnProperty(name)) {
    log("A drop field with this id already exists. Please use another value for 'name'");
    return;
  }

  if (!settings["size"]) {
    settings["size"] = new Size(400, 350);
  }

  if (settings["defaultThumbImg"]) {
    DropFields[name].settings.defaultThumbImg = settings["defaultThumbImg"];
  }

  DropFields[name] = new Drop(name, settings);
  DropFields[name].core.create();

  relativeFunction(function () {
    if (settings["container"]) {
      settings["container"].append(DropFields[name].template);
    } else {
      $("body").append(DropFields[name].template);
    }

    DropFields[name].core.init();

    relativeFunction(function () {
      DropFields[name].Representation().show();

      DropFields[name].ThumbImg.setDefaultUploadedImgSize(new Size(
        "auto",
        DropFields[name].ThumbImg.maxThumbSize.height
      ));

      DropFields[name].sizeAndLocation.updateRelativeSizes();
      DropFields[name].ThumbImg.Representation().show();
      DropFields[name].ThumbImg.centerThumbImg();
      DropFields[name].core.ready = true;
    }, "DropFields['" + name + "'].core.initialized", "is", true);
  }, "DropFields['" + name + "'].template", "not", null);

  return DropFields[name];
}