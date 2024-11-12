using Microsoft.ML.Data;

namespace ML_WebInterface.Models
{
    public class OnnxRecognOutput
    {
        [ColumnName("OutPut10x1")]  // эт название выходного слоя
        public float[] Score;       // массив на 10 элементов (0 - 9).
    }
}
