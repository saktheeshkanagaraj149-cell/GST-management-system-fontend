// Make sure it looks like this:

exports.createProduct = async (req, res) => {
  try {
    const { name, hsn, unit, rate, gstRate, category } = req.body;

    // ✅ Validate required fields
    if (!name || !rate) {
      return res.status(400).json({ 
        message: 'Product validation failed: name and rate are required' 
      });
    }

    // ✅ Create new product
    const product = new Product({
      name,
      hsn: hsn || '',
      unit: unit || 'Nos',
      rate,
      gstRate: gstRate || 18,
      category: category || '',
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(400).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, hsn, unit, rate, gstRate, category } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, hsn, unit, rate, gstRate, category },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(400).json({ message: err.message });
  }
};