$(function () {
    var COLORS = ["rgb(255, 223, 73)", "rgb(202, 164, 206)", "rgb(165, 189, 227)", "rgb(198, 216, 110)", "rgb(113, 189, 134)", "white", "rgb(255, 239, 71)", "rgb(43, 42, 41)"];
    var $regions = $("#map #oblasts > path");
    var $regionsWithLabels = $("#map #oblasts > path, #map .oblast-labels text");
    // var $labels = $("#map .regions  g > path , #map .regions  .label");
    var DEFAULT_STROKE = {"stroke": "gray", "stroke-width": "2px"};

    function drawImageToCanvas(callback) {
        var svg = $("#map").clone();
        //svg.find("svg").attr("height","296.616mm");
        var blob = new Blob([svg.html()], {type: 'image/svg+xml'});
        var url = URL.createObjectURL(blob);
        svg.remove();
        var image = new Image;
        image.src = url;
        image.onload = function () {

            var canvas = document.querySelector("canvas");
            $(canvas).show();
            var scaleFactor = 8; // Desired scale factor (e.g., 2 for doubling the size)
            var newWidth = image.width * scaleFactor;
            var newHeight = image.height * scaleFactor;

            canvas.width = newWidth;
            canvas.height = newHeight;


            var context = canvas.getContext("2d");

            context.drawImage(image, 0, 0, newWidth, newHeight);

            callback(canvas);
            $(canvas).hide();
        };
    }

    function clearMap() {
        $regions.each(function () {
            $(this).css("fill", "white")
                .addClass("unassigned")
                .attr(DEFAULT_STROKE);

        })
    };

    function saveSVG() {
        var svg = $("#map").clone();
        //svg.find("svg").attr("height","296.616mm");
        var blob = new Blob([svg.html()], {type: 'image/svg+xml'});
        var url = URL.createObjectURL(blob);
        svg.remove();
        var a = document.createElement("a");
        a.download = "ua-map.svg";
        a.href = url;
        a.click();
    }

    function savePNG() {
        drawImageToCanvas(function (canvas) {
            var a = document.createElement("a");
            a.download = "ua-map.png";
            a.href = canvas.toDataURL("image/png");
            a.click();
        });
    };

    function copyToClipboard() {
        drawImageToCanvas(function (canvas) {
            canvas.toBlob(function (blob) {
                var item = new ClipboardItem({'image/png': blob});
                navigator.clipboard.write([item]);
            });
        });
    }

    var $colors = $("#colors");

    COLORS.forEach(function (color) {
        $('<div class="color" style="background-color:' + color + '" data-color="' + color + '"></div>').appendTo($colors);
    });
    var selectedColor = "white";
    $colors.on("click", ".color", function () {
        selectedColor = $(this).data("color");
        $colors.find(".color").removeClass("selected");
        $(this).addClass("selected");
    });
    $colors.on("dblclick", ".color", function () {
        $regions.css("fill", selectedColor);
    });
    $colors.find(".color:first").click();
    $regionsWithLabels.on("mouseenter", function () {
        $("path[data-oblast='" + $(this).attr('data-oblast') + "']").each(function () {
            $(this).data("old-fill", $(this).css("fill"));
            $(this).css("fill", selectedColor);
        });

    });
    $regionsWithLabels.on("mouseleave", function () {
        $("path[data-oblast='" + $(this).attr('data-oblast') + "']").each(function () {
            $(this).css("fill", $(this).data("old-fill"));
            $(this).removeData("old-fill");
        });
    });

    $regionsWithLabels.on("click", function () {
        var newColor;
        $("path[data-oblast='" + $(this).attr('data-oblast') + "']").each(function () {
            if ($(this).data("old-fill") == selectedColor) {
                newColor = "white";
            } else {
                newColor = selectedColor;
            }
            $(this).css("fill", newColor);
            $(this).data("old-fill", newColor)
        });
    });
    $("#options .clearAll").click(clearMap);
    $("#options .toggleBorder").on("click", function () {
        $(this).toggleClass("disabled");
        $regions.each(function () {
            if (!$(this).attr("stroke")) {
                $(this).attr(DEFAULT_STROKE);
            } else {
                $(this).removeAttr("stroke");
            }

        });
    });
    $("#options .toggleLabels").on("click", function () {

        $(this).toggleClass("disabled");
        $(".oblast-labels").toggle();
    });
    $("#options .saveSVG").on("click", function () {
        saveSVG();
    });
    $("#options .copyClipboard").on("click", function () {
        copyToClipboard();
    });
    $("#options .savePNG").on("click", function () {
        savePNG();
    });
    clearMap();

});