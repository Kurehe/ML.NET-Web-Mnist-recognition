using Microsoft.ML.Data;

namespace ML_WebInterface.Models
{
    public class OnnxRecognInput
    {
        [ColumnName("28x28x1_input")]    // эт так слой называется
        [VectorType(784)]                // 28 x 28
        public float[] PixelValues;
    }
}
