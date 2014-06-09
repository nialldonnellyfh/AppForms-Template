/**!
 * SignaturePad: A jQuery plugin for assisting in the creation of an HTML5 canvas based signature pad. Records the drawn signature in JSON for later regeneration.
 * @project signature-pad
 * @author Thomas J Bradley <hey@thomasjbradley.ca>
 * @link http://thomasjbradley.ca/lab/signature-pad
 * @link https://github.com/thomasjbradley/signature-pad
 * @copyright 2014 Thomas J Bradley
 * @license BSD-3-CLAUSE
 * @version 2.5.1
 */
! function($) {
  function SignaturePad(selector, options) {
    function clearMouseLeaveTimeout() {
      clearTimeout(mouseLeaveTimeout), mouseLeaveTimeout = !1, mouseButtonDown = !1
    }

    function drawLine(e, newYOffset) {
      var offset, newX, newY;
      return e.preventDefault(), offset = $(e.target).offset(), clearTimeout(mouseLeaveTimeout), mouseLeaveTimeout = !1, "undefined" != typeof e.targetTouches ? (newX = Math.floor(e.targetTouches[0].pageX - offset.left), newY = Math.floor(e.targetTouches[0].pageY - offset.top)) : (newX = Math.floor(e.pageX - offset.left), newY = Math.floor(e.pageY - offset.top)), previous.x === newX && previous.y === newY ? !0 : (null === previous.x && (previous.x = newX), null === previous.y && (previous.y = newY), newYOffset && (newY += newYOffset), canvasContext.beginPath(), canvasContext.moveTo(previous.x, previous.y), canvasContext.lineTo(newX, newY), canvasContext.lineCap = settings.penCap, canvasContext.stroke(), canvasContext.closePath(), output.push({
        lx: newX,
        ly: newY,
        mx: previous.x,
        my: previous.y
      }), previous.x = newX, previous.y = newY, void(settings.onDraw && "function" == typeof settings.onDraw && settings.onDraw.apply(self)))
    }

    function stopDrawingWrapper() {
      stopDrawing()
    }

    function stopDrawing(e) {
      e ? drawLine(e, 1) : (touchable ? canvas.each(function() {
        this.removeEventListener("touchmove", drawLine)
      }) : canvas.unbind("mousemove.signaturepad"), output.length > 0 && settings.onDrawEnd && "function" == typeof settings.onDrawEnd && settings.onDrawEnd.apply(self)), previous.x = null, previous.y = null, settings.output && output.length > 0 && $(settings.output, context).val(JSON.stringify(output))
    }

    function drawSigLine() {
      return settings.lineWidth ? (canvasContext.beginPath(), canvasContext.lineWidth = settings.lineWidth, canvasContext.strokeStyle = settings.lineColour, canvasContext.moveTo(settings.lineMargin, settings.lineTop), canvasContext.lineTo(element.width - settings.lineMargin, settings.lineTop), canvasContext.stroke(), void canvasContext.closePath()) : !1
    }

    function clearCanvas() {
      canvasContext.clearRect(0, 0, element.width, element.height), canvasContext.fillStyle = settings.bgColour, canvasContext.fillRect(0, 0, element.width, element.height), settings.displayOnly || drawSigLine(), canvasContext.lineWidth = settings.penWidth, canvasContext.strokeStyle = settings.penColour, $(settings.output, context).val(""), output = [], stopDrawing()
    }

    function onMouseMove(e, o) {
      null == previous.x ? drawLine(e, 1) : drawLine(e, o)
    }

    function startDrawing(e, touchObject) {
      touchable ? touchObject.addEventListener("touchmove", onMouseMove, !1) : canvas.bind("mousemove.signaturepad", onMouseMove), drawLine(e, 1)
    }

    function disableCanvas() {
      eventsBound = !1, canvas.each(function() {
        this.removeEventListener && (this.removeEventListener("touchend", stopDrawingWrapper), this.removeEventListener("touchcancel", stopDrawingWrapper), this.removeEventListener("touchmove", drawLine)), this.ontouchstart && (this.ontouchstart = null)
      }), $(document).unbind("mouseup.signaturepad"), canvas.unbind("mousedown.signaturepad"), canvas.unbind("mousemove.signaturepad"), canvas.unbind("mouseleave.signaturepad"), $(settings.clear, context).unbind("click.signaturepad")
    }

    function initDrawEvents(e) {
      return eventsBound ? !1 : (eventsBound = !0, $("input").blur(), "undefined" != typeof e.targetTouches && (touchable = !0), void(touchable ? (canvas.each(function() {
        this.addEventListener("touchend", stopDrawingWrapper, !1), this.addEventListener("touchcancel", stopDrawingWrapper, !1)
      }), canvas.unbind("mousedown.signaturepad")) : ($(document).bind("mouseup.signaturepad", function() {
        mouseButtonDown && (stopDrawing(), clearMouseLeaveTimeout())
      }), canvas.bind("mouseleave.signaturepad", function(e) {
        mouseButtonDown && stopDrawing(e), mouseButtonDown && !mouseLeaveTimeout && (mouseLeaveTimeout = setTimeout(function() {
          stopDrawing(), clearMouseLeaveTimeout()
        }, 500))
      }), canvas.each(function() {
        this.ontouchstart = null
      }))))
    }

    function drawIt() {
      $(settings.typed, context).hide(), clearCanvas(), canvas.each(function() {
        this.ontouchstart = function(e) {
          e.preventDefault(), mouseButtonDown = !0, initDrawEvents(e), startDrawing(e, this)
        }
      }), canvas.bind("mousedown.signaturepad", function(e) {
        return e.preventDefault(), e.which > 1 ? !1 : (mouseButtonDown = !0, initDrawEvents(e), void startDrawing(e))
      }), $(settings.clear, context).bind("click.signaturepad", function(e) {
        e.preventDefault(), clearCanvas()
      }), $(settings.typeIt, context).bind("click.signaturepad", function(e) {
        e.preventDefault(), typeIt()
      }), $(settings.drawIt, context).unbind("click.signaturepad"), $(settings.drawIt, context).bind("click.signaturepad", function(e) {
        e.preventDefault()
      }), $(settings.typeIt, context).removeClass(settings.currentClass), $(settings.drawIt, context).addClass(settings.currentClass), $(settings.sig, context).addClass(settings.currentClass), $(settings.typeItDesc, context).hide(), $(settings.drawItDesc, context).show(), $(settings.clear, context).show()
    }

    function typeIt() {
      clearCanvas(), disableCanvas(), $(settings.typed, context).show(), $(settings.drawIt, context).bind("click.signaturepad", function(e) {
        e.preventDefault(), drawIt()
      }), $(settings.typeIt, context).unbind("click.signaturepad"), $(settings.typeIt, context).bind("click.signaturepad", function(e) {
        e.preventDefault()
      }), $(settings.output, context).val(""), $(settings.drawIt, context).removeClass(settings.currentClass), $(settings.typeIt, context).addClass(settings.currentClass), $(settings.sig, context).removeClass(settings.currentClass), $(settings.drawItDesc, context).hide(), $(settings.clear, context).hide(), $(settings.typeItDesc, context).show(), typeItCurrentFontSize = typeItDefaultFontSize = $(settings.typed, context).css("font-size").replace(/px/, "")
    }

    function type(val) {
      var typed = $(settings.typed, context),
        cleanedVal = $.trim(val.replace(/>/g, "&gt;").replace(/</g, "&lt;")),
        oldLength = typeItNumChars,
        edgeOffset = .5 * typeItCurrentFontSize;
      if (typeItNumChars = cleanedVal.length, typed.html(cleanedVal), !cleanedVal) return void typed.css("font-size", typeItDefaultFontSize + "px");
      if (typeItNumChars > oldLength && typed.outerWidth() > element.width)
        for (; typed.outerWidth() > element.width;) typeItCurrentFontSize--, typed.css("font-size", typeItCurrentFontSize + "px");
      if (oldLength > typeItNumChars && typed.outerWidth() + edgeOffset < element.width && typeItDefaultFontSize > typeItCurrentFontSize)
        for (; typed.outerWidth() + edgeOffset < element.width && typeItDefaultFontSize > typeItCurrentFontSize;) typeItCurrentFontSize++, typed.css("font-size", typeItCurrentFontSize + "px")
    }

    function onBeforeValidate(context, settings) {
      $("p." + settings.errorClass, context).remove(), context.removeClass(settings.errorClass), $("input, label", context).removeClass(settings.errorClass)
    }

    function onFormError(errors, context, settings) {
      errors.nameInvalid && (context.prepend(['<p class="', settings.errorClass, '">', settings.errorMessage, "</p>"].join("")), $(settings.name, context).focus(), $(settings.name, context).addClass(settings.errorClass), $("label[for=" + $(settings.name).attr("id") + "]", context).addClass(settings.errorClass)), errors.drawInvalid && context.prepend(['<p class="', settings.errorClass, '">', settings.errorMessageDraw, "</p>"].join(""))
    }

    function validateForm() {
      var valid = !0,
        errors = {
          drawInvalid: !1,
          nameInvalid: !1
        }, onBeforeArguments = [context, settings],
        onErrorArguments = [errors, context, settings];
      return settings.onBeforeValidate && "function" == typeof settings.onBeforeValidate ? settings.onBeforeValidate.apply(self, onBeforeArguments) : onBeforeValidate.apply(self, onBeforeArguments), settings.drawOnly && output.length < 1 && (errors.drawInvalid = !0, valid = !1), "" === $(settings.name, context).val() && (errors.nameInvalid = !0, valid = !1), settings.onFormError && "function" == typeof settings.onFormError ? settings.onFormError.apply(self, onErrorArguments) : onFormError.apply(self, onErrorArguments), valid
    }

    function drawSignature(paths, context, saveOutput) {
      for (var i in paths) "object" == typeof paths[i] && (context.beginPath(), context.moveTo(paths[i].mx, paths[i].my), context.lineTo(paths[i].lx, paths[i].ly), context.lineCap = settings.penCap, context.stroke(), context.closePath(), saveOutput && output.push({
        lx: paths[i].lx,
        ly: paths[i].ly,
        mx: paths[i].mx,
        my: paths[i].my
      }))
    }

    function init() {
      parseFloat((/CPU.+OS ([0-9_]{3}).*AppleWebkit.*Mobile/i.exec(navigator.userAgent) || [0, "4_2"])[1].replace("_", ".")) < 4.1 && ($.fn.Oldoffset = $.fn.offset, $.fn.offset = function() {
        var result = $(this).Oldoffset();
        return result.top -= window.scrollY, result.left -= window.scrollX, result
      }), $(settings.typed, context).bind("selectstart.signaturepad", function(e) {
        return $(e.target).is(":input")
      }), canvas.bind("selectstart.signaturepad", function(e) {
        return $(e.target).is(":input")
      }), !element.getContext && FlashCanvas && FlashCanvas.initElement(element), element.getContext && (canvasContext = element.getContext("2d"), $(settings.sig, context).show(), settings.displayOnly || (settings.drawOnly || ($(settings.name, context).bind("keyup.signaturepad", function() {
        type($(this).val())
      }), $(settings.name, context).bind("blur.signaturepad", function() {
        type($(this).val())
      }), $(settings.drawIt, context).bind("click.signaturepad", function(e) {
        e.preventDefault(), drawIt()
      })), settings.drawOnly || "drawIt" === settings.defaultAction ? drawIt() : typeIt(), settings.validateFields && ($(selector).is("form") ? $(selector).bind("submit.signaturepad", function() {
        return validateForm()
      }) : $(selector).parents("form").bind("submit.signaturepad", function() {
        return validateForm()
      })), $(settings.sigNav, context).show()))
    }
    var self = this,
      settings = $.extend({}, $.fn.signaturePad.defaults, options),
      context = $(selector),
      canvas = $(settings.canvas, context),
      element = canvas.get(0),
      canvasContext = null,
      previous = {
        x: null,
        y: null
      }, output = [],
      mouseLeaveTimeout = !1,
      mouseButtonDown = !1,
      touchable = !1,
      eventsBound = !1,
      typeItDefaultFontSize = 30,
      typeItCurrentFontSize = typeItDefaultFontSize,
      typeItNumChars = 0;
    $.extend(self, {
      signaturePad: "2.5.1",
      init: function() {
        init()
      },
      updateOptions: function(options) {
        $.extend(settings, options)
      },
      regenerate: function(paths) {
        self.clearCanvas(), $(settings.typed, context).hide(), "string" == typeof paths && (paths = JSON.parse(paths)), drawSignature(paths, canvasContext, !0), settings.output && $(settings.output, context).length > 0 && $(settings.output, context).val(JSON.stringify(output))
      },
      clearCanvas: function() {
        clearCanvas()
      },
      getSignature: function() {
        return output
      },
      getSignatureString: function() {
        return JSON.stringify(output)
      },
      getSignatureImage: function() {
        var tmpCanvas = document.createElement("canvas"),
          tmpContext = null,
          data = null;
        return tmpCanvas.style.position = "absolute", tmpCanvas.style.top = "-999em", tmpCanvas.width = element.width, tmpCanvas.height = element.height, document.body.appendChild(tmpCanvas), !tmpCanvas.getContext && FlashCanvas && FlashCanvas.initElement(tmpCanvas), tmpContext = tmpCanvas.getContext("2d"), tmpContext.fillStyle = settings.bgColour, tmpContext.fillRect(0, 0, element.width, element.height), tmpContext.lineWidth = settings.penWidth, tmpContext.strokeStyle = settings.penColour, drawSignature(output, tmpContext), data = tmpCanvas.toDataURL.apply(tmpCanvas, arguments), document.body.removeChild(tmpCanvas), tmpCanvas = null, data
      },
      validateForm: function() {
        return validateForm()
      }
    })
  }
  $.fn.signaturePad = function(options) {
    var api = null;
    return this.each(function() {
      $.data(this, "plugin-signaturePad") ? (api = $.data(this, "plugin-signaturePad"), api.updateOptions(options)) : (api = new SignaturePad(this, options), api.init(), $.data(this, "plugin-signaturePad", api))
    }), api
  }, $.fn.signaturePad.defaults = {
    defaultAction: "typeIt",
    displayOnly: !1,
    drawOnly: !1,
    canvas: "canvas",
    sig: ".sig",
    sigNav: ".sigNav",
    bgColour: "#ffffff",
    penColour: "#145394",
    penWidth: 2,
    penCap: "round",
    lineColour: "#ccc",
    lineWidth: 2,
    lineMargin: 5,
    lineTop: 35,
    name: ".name",
    typed: ".typed",
    clear: ".clearButton",
    typeIt: ".typeIt a",
    drawIt: ".drawIt a",
    typeItDesc: ".typeItDesc",
    drawItDesc: ".drawItDesc",
    output: ".output",
    currentClass: "current",
    validateFields: !0,
    errorClass: "error",
    errorMessage: "Please enter your name",
    errorMessageDraw: "Please sign the document",
    onBeforeValidate: null,
    onFormError: null,
    onDraw: null,
    onDrawEnd: null
  }
}(jQuery);]