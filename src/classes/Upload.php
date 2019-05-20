<?php

/**
 * Class Upload
 */
class Upload
{
    private $data = null;
    private $info = [];

    /**
     * @param string $data
     *
     * @return Upload
     */
    public function setData(string $data): Upload
    {
        $this->data = $data;

        return $this;
    }

    /**
     * @param array $info
     *
     * @return Upload
     */
    public function setFileInfo(array $info): Upload
    {
        $this->info = $info;

        return $this;
    }

    /**
     * @return bool
     */
    public function save(): bool
    {
        $handle = fopen(TMP_DIR . $this->info['hash'], "a");

        if (!$handle) {
            return false;
        }

        $bin = base64_decode($this->data);
        fwrite($handle, $bin);
        fclose($handle);

        if ($this->checkToMove()) {
            return $this->move();
        }

        return true;
    }

    /**
     * @return bool
     */
    private function checkToMove(): bool
    {
        return filesize(TMP_DIR . $this->info['hash']) == $this->info['size'];
    }

    /**
     * @return bool
     */
    private function move(): bool
    {
        mkdir(DATA_DIR . $this->info['hash']);

        return rename(TMP_DIR . $this->info['hash'], DATA_DIR . $this->info['hash'] . "/" . $this->info['name']);
    }

}
