module App.Utils.Icon {
    
    /**
     * Добавляет к названию класса иконки соответствующий класс для правильного отображения библиотеками FontAwesome и GlyphIcon
     * По умолчанию используется FontAwesome
     */
    export function ExpandClass(iconName: string): string {
        if (!iconName) return iconName;
        if (iconName.Contains("fa-") && !iconName.Contains("fa ") && !iconName.Contains(" fa"))
            return "fa " + iconName;
        if (iconName.Contains("glyphicon-") && !iconName.Contains("glyphicon ") && !iconName.Contains(" glyphicon"))
            return "glyphicon " + iconName;
        return "fa fa-" + iconName;
    }
} 